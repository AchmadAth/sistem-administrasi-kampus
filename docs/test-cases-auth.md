# Test Cases - Authentication & Authorization

## Overview
Test cases for authentication system and role-based access control (RBAC).

## Test Environment
- Backend: Node.js + Express
- Authentication: JWT (JSON Web Tokens)
- Database: PostgreSQL

---

## 1. User Registration Tests

### TC-AUTH-001: Successful User Registration
**Description**: Test successful registration of a new user  
**Preconditions**: Valid user data provided  
**Test Steps**:
1. Send POST request to `/api/auth/register` with valid data
2. Verify response status is 201
3. Verify user is created in database
4. Verify password is hashed

**Expected Result**: User registered successfully, password hashed, user ID returned

**Test Data**:
```json
{
  "email": "mahasiswa@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "student",
  "nim": "2021001"
}
```

### TC-AUTH-002: Registration with Duplicate Email
**Description**: Test registration with existing email  
**Expected Result**: Error 400 - Email already exists

### TC-AUTH-003: Registration with Invalid Data
**Description**: Test registration with missing required fields  
**Expected Result**: Error 400 - Validation error

---

## 2. Login Tests

### TC-AUTH-010: Successful Login - Student
**Description**: Test successful login for student role  
**Test Steps**:
1. Send POST request to `/api/auth/login` with valid credentials
2. Verify response status is 200
3. Verify JWT token is returned
4. Verify token contains user ID and role

**Expected Result**: Login successful, valid JWT token returned

**Test Data**:
```json
{
  "email": "mahasiswa@example.com",
  "password": "SecurePass123!"
}
```

### TC-AUTH-011: Successful Login - Admin
**Description**: Test successful login for admin role  
**Expected Result**: Login successful with admin privileges

### TC-AUTH-012: Successful Login - Supervisor
**Description**: Test successful login for supervisor role  
**Expected Result**: Login successful with supervisor privileges

### TC-AUTH-013: Successful Login - Lecturer
**Description**: Test successful login for lecturer role  
**Expected Result**: Login successful with lecturer privileges

### TC-AUTH-014: Login with Invalid Credentials
**Description**: Test login with wrong password  
**Expected Result**: Error 401 - Invalid credentials

### TC-AUTH-015: Login with Non-existent Email
**Description**: Test login with email not in database  
**Expected Result**: Error 401 - Invalid credentials

---

## 3. Token Validation Tests

### TC-AUTH-020: Access Protected Route with Valid Token
**Description**: Test accessing protected endpoint with valid JWT  
**Test Steps**:
1. Login to get valid token
2. Send request to protected route with token in Authorization header
3. Verify access granted

**Expected Result**: Access granted, user data returned

### TC-AUTH-021: Access Protected Route without Token
**Description**: Test accessing protected endpoint without token  
**Expected Result**: Error 401 - No token provided

### TC-AUTH-022: Access Protected Route with Expired Token
**Description**: Test accessing protected endpoint with expired JWT  
**Expected Result**: Error 401 - Token expired

### TC-AUTH-023: Access Protected Route with Invalid Token
**Description**: Test accessing protected endpoint with malformed token  
**Expected Result**: Error 401 - Invalid token

---

## 4. Role-Based Access Control (RBAC) Tests

### TC-RBAC-001: Student Access to Student Routes
**Description**: Test student accessing student-only routes  
**Expected Result**: Access granted

### TC-RBAC-002: Student Access to Admin Routes
**Description**: Test student attempting to access admin-only routes  
**Expected Result**: Error 403 - Forbidden

### TC-RBAC-003: Student Access to Supervisor Routes
**Description**: Test student attempting to access supervisor-only routes  
**Expected Result**: Error 403 - Forbidden

### TC-RBAC-004: Admin Access to All Routes
**Description**: Test admin accessing all system routes  
**Expected Result**: Access granted to all routes

### TC-RBAC-005: Supervisor Access to Supervisor Routes
**Description**: Test supervisor accessing supervisor-specific routes  
**Expected Result**: Access granted

### TC-RBAC-006: Supervisor Access to Student Data
**Description**: Test supervisor viewing student letter requests  
**Expected Result**: Access granted, can view all student requests

### TC-RBAC-007: Lecturer Access to Lecturer Routes
**Description**: Test lecturer accessing lecturer-specific routes  
**Expected Result**: Access granted

---

## 5. Logout Tests

### TC-AUTH-030: Successful Logout
**Description**: Test user logout functionality  
**Test Steps**:
1. Login to get valid token
2. Send POST request to `/api/auth/logout`
3. Verify token is invalidated (if using token blacklist)

**Expected Result**: Logout successful

### TC-AUTH-031: Logout without Token
**Description**: Test logout without authentication  
**Expected Result**: Error 401 - Not authenticated

---

## 6. Password Management Tests

### TC-AUTH-040: Password Reset Request
**Description**: Test password reset request functionality  
**Expected Result**: Reset email sent, reset token generated

### TC-AUTH-041: Password Reset with Valid Token
**Description**: Test password reset with valid reset token  
**Expected Result**: Password updated successfully

### TC-AUTH-042: Password Reset with Expired Token
**Description**: Test password reset with expired token  
**Expected Result**: Error 400 - Token expired

---

## 7. Security Tests

### TC-SEC-001: SQL Injection Prevention
**Description**: Test SQL injection attempts in login  
**Expected Result**: Attack prevented, no database compromise

### TC-SEC-002: XSS Prevention
**Description**: Test XSS attempts in input fields  
**Expected Result**: Attack prevented, input sanitized

### TC-SEC-003: Brute Force Protection
**Description**: Test multiple failed login attempts  
**Expected Result**: Account locked or rate limited after threshold

### TC-SEC-004: Password Strength Validation
**Description**: Test weak password rejection  
**Expected Result**: Weak passwords rejected with error message

---

## Test Execution Summary

| Category | Total Tests | Passed | Failed | Pending |
|----------|-------------|--------|--------|---------|
| Registration | 3 | 0 | 0 | 3 |
| Login | 6 | 0 | 0 | 6 |
| Token Validation | 4 | 0 | 0 | 4 |
| RBAC | 7 | 0 | 0 | 7 |
| Logout | 2 | 0 | 0 | 2 |
| Password Management | 3 | 0 | 0 | 3 |
| Security | 4 | 0 | 0 | 4 |
| **TOTAL** | **29** | **0** | **0** | **29** |

---

## Notes
- All tests should be automated using Jest and Supertest
- Tests should be run in isolated test database
- Mock email/SMS services for testing
- Use test fixtures for consistent test data
