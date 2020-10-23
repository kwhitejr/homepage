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

# Get manually created Route 53 Hosted Zone id
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
  origin_bucket        = local.domain_name
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

# # AWS S3 bucket for static hosting
# resource "aws_s3_bucket" "website" {
#   bucket = var.website_bucket_name
#   acl    = "public-read"

#   cors_rule {
#     allowed_headers = ["*"]
#     allowed_methods = ["PUT", "POST"]
#     allowed_origins = ["*"]
#     expose_headers  = ["ETag"]
#     max_age_seconds = 3000
#   }

#   policy = <<EOF
# {
#   "Version": "2008-10-17",
#   "Statement": [
#     {
#       "Sid": "PublicReadForGetBucketObjects",
#       "Effect": "Allow",
#       "Principal": {
#         "AWS": "*"
#       },
#       "Action": "s3:GetObject",
#       "Resource": "arn:aws:s3:::${var.website_bucket_name}/*"
#     }
#   ]
# }
# EOF

#   website {
#     index_document = "index.html"
#     error_document = "error.html"
#   }
# }

# # AWS S3 bucket for www-redirect
# resource "aws_s3_bucket" "website_redirect" {
#   bucket = "www.${var.website_bucket_name}"
#   acl    = "public-read"

#   website {
#     redirect_all_requests_to = var.website_bucket_name
#   }
# }

# # AWS Cloudfront for caching
# resource "aws_cloudfront_distribution" "s3_distribution" {
#   origin {
#     domain_name = "${aws_s3_bucket.website.bucket}.s3.amazonaws.com"
#     origin_id   = "website"

#     s3_origin_config {
#       origin_access_identity = "origin-access-identity/cloudfront/ABCDEFG1234567"
#     }
#   }

#   aliases             = [var.domain_name]
#   enabled             = true
#   is_ipv6_enabled     = true
#   comment             = "kwhitejr.com CDN"
#   default_root_object = "index.html"

#   viewer_certificate {
#     minimum_protocol_version       = "TLSv1.2_2018"
#     ssl_support_method             = "sni-only"
#     cloudfront_default_certificate = false
#     acm_certificate_arn            = data.aws_acm_certificate.certificate.arn
#   }

#   default_cache_behavior {
#     allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
#     cached_methods   = ["GET", "HEAD"]
#     target_origin_id = "website"

#     forwarded_values {
#       query_string = true
#       headers      = ["*"]

#       cookies {
#         forward = "none"
#       }
#     }

#     viewer_protocol_policy = "allow-all"
#     min_ttl                = 0
#     default_ttl            = 3600
#     max_ttl                = 86400
#   }

#   price_class = "PriceClass_100"

#   restrictions {
#     geo_restriction {
#       restriction_type = "none"
#     }
#   }
# }

# resource "aws_route53_record" "main-a-record" {
#   type    = "A"
#   name    = var.domain_name
#   zone_id = data.aws_route53_zone.main.zone_id

#   alias {
#     name                   = aws_cloudfront_distribution.s3_distribution.domain_name
#     zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
#     evaluate_target_health = false
#   }
# }

# resource "aws_route53_record" "main-c-name" {
#   zone_id = data.aws_route53_zone.main.zone_id
#   name    = "www"
#   type    = "CNAME"
#   ttl     = "300"
#   records = [var.domain_name]
# }

# resource "aws_route53_record" "cert_validation" {
#   name    = "${data.aws_acm_certificate.certificate.domain_validation_options.0.resource_record_name}"
#   type    = "${data.aws_acm_certificate.certificate.domain_validation_options.0.resource_record_type}"
#   zone_id = "${data.aws_route53_zone.main.id}"
#   records = ["${data.aws_acm_certificate.certificate.domain_validation_options.0.resource_record_value}"]
#   ttl     = 60
# }
