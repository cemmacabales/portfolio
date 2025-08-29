// Input validation and sanitization utilities

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Sanitize input by removing potentially harmful characters
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove HTML/script injection characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 1000) // Limit length to prevent abuse
}

// Validate email format
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  return EMAIL_REGEX.test(email.trim())
}

// Validate name (letters, spaces, hyphens, apostrophes only)
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/
  return nameRegex.test(name.trim())
}

// Validate subject line
export const validateSubject = (subject) => {
  if (!subject || typeof subject !== 'string') return false
  const trimmed = subject.trim()
  return trimmed.length >= 3 && trimmed.length <= 100
}

// Validate message content
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') return false
  const trimmed = message.trim()
  return trimmed.length >= 10 && trimmed.length <= 2000
}

// Rate limiting helper (simple client-side implementation)
const RATE_LIMIT_KEY = 'contact_form_submissions'
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_SUBMISSIONS = 3

export const checkRateLimit = () => {
  try {
    const submissions = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]')
    const now = Date.now()
    
    // Filter out old submissions
    const recentSubmissions = submissions.filter(time => now - time < RATE_LIMIT_WINDOW)
    
    if (recentSubmissions.length >= MAX_SUBMISSIONS) {
      return false // Rate limit exceeded
    }
    
    // Add current submission
    recentSubmissions.push(now)
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions))
    
    return true // Within rate limit
  } catch (error) {
    console.warn('Rate limiting check failed:', error)
    return true // Allow submission if localStorage fails
  }
}

// Comprehensive form validation
export const validateFormData = (formData) => {
  const errors = {}
  
  // Validate name
  if (!validateName(formData.name)) {
    errors.name = 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
  }
  
  // Validate email
  if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  // Validate subject
  if (!validateSubject(formData.subject)) {
    errors.subject = 'Subject must be 3-100 characters long'
  }
  
  // Validate message
  if (!validateMessage(formData.message)) {
    errors.message = 'Message must be 10-2000 characters long'
  }
  
  // Validate project type (if provided)
  if (formData.projectType && !['Web Development', 'Mobile App', 'AI/ML Project', 'Data Analysis', 'Other'].includes(formData.projectType)) {
    errors.projectType = 'Please select a valid project type'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Sanitize entire form data object
export const sanitizeFormData = (formData) => {
  return {
    name: sanitizeInput(formData.name),
    email: sanitizeInput(formData.email),
    subject: sanitizeInput(formData.subject),
    message: sanitizeInput(formData.message),
    projectType: sanitizeInput(formData.projectType),
    timeline: sanitizeInput(formData.timeline),
    budget: sanitizeInput(formData.budget)
  }
}