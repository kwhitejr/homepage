terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket = "kwhitejr-terraform-remote-state"
    key    = "kwhitejr.com"
    region = "us-east-1"

    dynamodb_table = "cp-terraform-state-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}

locals {
  domain_name = "kwhitejr.com"
}

data "aws_route53_zone" "main" {
  name         = local.domain_name
  private_zone = false
}

data "aws_acm_certificate" "certificate" {
  domain      = local.domain_name
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}

module "cloudfront-s3-cdn" {
  source  = "cloudposse/cloudfront-s3-cdn/aws"
  version = "0.35.0"

  name                 = local.domain_name
  origin_force_destroy = true
  encryption_enabled   = true

  # DNS Settings
  parent_zone_id      = data.aws_route53_zone.main.id
  acm_certificate_arn = data.aws_acm_certificate.certificate.arn
  aliases             = [local.domain_name, "www.${local.domain_name}"]
  ipv6_enabled        = true

  # Caching Settings
  default_ttl = 300
  compress    = true

  # Website settings
  website_enabled = true
  index_document  = "index.html"
  error_document  = "index.html"

  depends_on = [data.aws_acm_certificate.certificate]
}
