# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal personal homepage for Kevin White (kwhitejr) built with Eleventy (11ty) static site generator. It features a simple landing page with social media links and is deployed to AWS S3 via CloudFront CDN.

## Development Commands

### Core Development
- `npm run develop` or `npm start` - Start Eleventy development server with live reload
- `npm run build` - Build static site to `_site/` directory
- `npm run clean` - Clean build output directory

### Code Quality
- Code formatting available via Prettier (configured in devDependencies)
- No test suite currently implemented

### Deployment
- Automated deployment via GitHub Actions to S3
- Terraform configuration in `/terraform/` manages AWS infrastructure

## Architecture

### Core Technologies
- **Eleventy (11ty) v3** - Lightweight static site generator
- **Nunjucks** - Template engine for HTML generation
- **Pure CSS** - Custom styling with CSS3 features
- **SVG Icons** - Inline SVG icons for social media links

### Key Directories
- `src/` - Source files for the site
- `src/_includes/` - Nunjucks layout templates
- `src/assets/` - Static assets (CSS, icons)
- `_site/` - Generated static site output
- `terraform/` - AWS infrastructure as code

### Site Structure
- Single-page application with social media links
- Responsive design with mobile-first approach
- Black background with purple accent theme
- Hover effects and accessibility features

### Key Files
- **layout.njk** (`src/_includes/layout.njk`) - Base HTML template
- **index.njk** (`src/index.njk`) - Main landing page
- **style.css** (`src/assets/css/style.css`) - All styling and responsive design

### Build Process
- Eleventy processes Nunjucks templates to generate HTML
- Static assets are copied to output directory
- No complex build pipeline - simple and fast generation

### Deployment Architecture
- Static files built to `/_site/` directory
- Deployed to S3 bucket via GitHub Actions
- CloudFront CDN for global distribution
- Route 53 for DNS management
- SSL certificate via AWS Certificate Manager

## Development Notes

### Styling
- Pure CSS with custom properties and modern features
- Inter font family from Google Fonts
- Responsive design with mobile-first approach
- Purple color scheme (#9333ea) with hover effects

### Site Features
- Accessible social media links with ARIA labels
- SVG icons for GitHub, Dev.to, and LinkedIn
- Smooth animations and hover effects
- Focus styles for keyboard navigation

### Code Quality
- Prettier for code formatting
- Simple and maintainable codebase
- Semantic HTML structure