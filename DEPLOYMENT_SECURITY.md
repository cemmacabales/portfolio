# Production Security Deployment Guide

This guide outlines the security configurations implemented in this portfolio application and how to deploy them in production.

## Environment Variables

Ensure these environment variables are set in your production environment:

```bash
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## Rate Limiting Configuration

The application includes client-side rate limiting, but production deployments should implement server-side rate limiting:

### Netlify

Add to your `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.emailjs.com; font-src 'self' data:;"

# Rate limiting via Netlify Edge Functions (requires Pro plan)
[[edge_functions]]
  function = "rate-limit"
  path = "/api/*"
```

### Vercel

Add to your `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.emailjs.com; font-src 'self' data:;"
        }
      ]
    }
  ]
}
```

### Cloudflare Pages

Use Cloudflare's built-in rate limiting rules:

1. Go to Security > WAF > Rate limiting rules
2. Create a rule with:
   - Match: `http.request.uri.path contains "/contact"`
   - Rate: 5 requests per 15 minutes
   - Action: Block

### Apache (.htaccess)

```apache
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.emailjs.com; font-src 'self' data:;"

# Rate Limiting (requires mod_evasive)
<IfModule mod_evasive24.c>
    DOSHashTableSize    2048
    DOSPageCount        5
    DOSPageInterval     900
    DOSSiteCount        50
    DOSSiteInterval     600
    DOSBlockingPeriod   900
</IfModule>
```

### Nginx

```nginx
# Rate limiting
http {
    limit_req_zone $binary_remote_addr zone=contact:10m rate=5r/15m;
    
    server {
        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.emailjs.com; font-src 'self' data:;";
        
        # Apply rate limiting to contact endpoints
        location ~* /(contact|api) {
            limit_req zone=contact burst=2 nodelay;
        }
    }
}
```

## Security Features Implemented

### 1. Environment Variable Protection
- EmailJS credentials moved to environment variables
- `.env` added to `.gitignore`
- `.env.example` provided for deployment reference

### 2. Input Validation & Sanitization
- Client-side form validation with real-time feedback
- Input sanitization to prevent XSS attacks
- Email format validation
- Message length limits

### 3. Rate Limiting
- Client-side rate limiting (5 requests per 15 minutes)
- Development server rate limiting middleware
- Production deployment configurations for major platforms

### 4. Security Headers
- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy for camera, microphone, geolocation

### 5. Build Optimization
- Code splitting for better performance
- Asset optimization
- Chunk size warnings
- ES2015 target for broad compatibility

## Monitoring & Maintenance

1. **Monitor Rate Limiting**: Check your hosting platform's analytics for blocked requests
2. **Update Dependencies**: Regularly update packages for security patches
3. **Review CSP**: Adjust Content Security Policy as needed for new integrations
4. **Environment Variables**: Rotate EmailJS keys periodically
5. **Security Headers**: Test headers using tools like securityheaders.com

## Testing Security

Before deploying to production:

1. Test rate limiting by submitting multiple contact forms
2. Verify environment variables are loaded correctly
3. Check security headers using browser developer tools
4. Validate form inputs with various payloads
5. Test CSP by checking for console errors

For additional security, consider implementing:
- CAPTCHA for contact forms
- Server-side validation
- Request logging and monitoring
- DDoS protection at the CDN level