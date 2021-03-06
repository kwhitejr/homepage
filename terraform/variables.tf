variable "aws_region" {
  type        = string
  description = "the AWS S3 deployment region"
  default     = "us-east-1"
}

variable "domain_name" {
  type        = string
  description = "the domain name"
  default     = "kwhitejr.com"
}

variable "website_bucket_name" {
  type        = string
  description = "the S3 bucket name"
  default     = "kwhitejr.com" # in this case is the same as the domain name
}
