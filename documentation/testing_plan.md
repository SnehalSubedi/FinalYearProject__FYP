# Testing Plan

The testing strategy for the PlantGuard AI-Powered Agricultural Intelligence Platform is structured into two major categories: **Unit Testing** and **System Testing**. Unit Testing validates individual backend components, APIs, services, and model inference logic in isolation using the FastAPI Swagger interface. System Testing validates the complete integrated application through frontend workflows, ensuring end-to-end functionality across the React frontend and FastAPI backend.

---

## 1. Unit Testing

Unit testing focuses on validating individual backend components, APIs, and service-level logic in isolation using the FastAPI Swagger interface.

### 1.1 Core Application and Environment Unit Tests

#### 1.1.1 UT-01 -- Root Endpoint Validation

Verify that the root endpoint (`/`) returns API metadata including application name ("Plant Disease Detection API"), version ("1.0.0"), and current status ("running").

#### 1.1.2 UT-02 -- Health Check Endpoint

Ensure the `/health` endpoint returns system status as `"healthy"` along with the application name and version.

#### 1.1.3 UT-03 -- Upload Directory Initialization

Validate that the required `uploads` directory is automatically created at application startup when it does not already exist.

#### 1.1.4 UT-04 -- Static File Serving

Verify that uploaded files are correctly served via the `/uploads` route and are accessible as static resources.

#### 1.1.5 UT-05 -- CORS Configuration

Ensure CORS middleware is properly configured to allow all origins, methods, headers, and credentials for cross-origin frontend-backend communication.

---

### 1.2 Authentication and OTP Unit Tests

#### 1.2.1 UT-06 -- Send OTP (Valid Registration Data)

Verify that submitting valid registration data (full name, email, username, password, phone) to `/auth/send-otp` generates a 6-digit OTP and sends it via Aakash SMS API to the provided Nepali phone number.

#### 1.2.2 UT-07 -- Send OTP (Duplicate Username)

Ensure the system rejects OTP request when the username already exists in the database and returns an appropriate error message.

#### 1.2.3 UT-08 -- Send OTP (Duplicate Email)

Verify the system rejects OTP request when the email is already registered.

#### 1.2.4 UT-09 -- Send OTP (Duplicate Phone Number)

Ensure OTP request is rejected when the phone number is already associated with an existing account.

#### 1.2.5 UT-10 -- Send OTP (Invalid Phone Format)

Verify that phone numbers not matching the Nepali format (10 digits starting with 98, 97, or 96) are rejected with a validation error.

#### 1.2.6 UT-11 -- Send OTP (Weak Password)

Ensure passwords that do not meet the minimum requirements (8 characters, 1 uppercase letter, 1 digit) are rejected during OTP request.

#### 1.2.7 UT-12 -- Send OTP (Invalid Username Format)

Verify that usernames shorter than 3 characters or containing special characters (other than underscore) are rejected.

#### 1.2.8 UT-13 -- Verify OTP (Valid OTP)

Verify that submitting the correct 6-digit OTP for a registered phone number completes user registration, stores user data in `users.json`, and returns a success message.

#### 1.2.9 UT-14 -- Verify OTP (Invalid OTP)

Ensure submitting an incorrect OTP returns a validation error ("Invalid OTP").

#### 1.2.10 UT-15 -- Verify OTP (Expired OTP)

Verify that OTP verification fails after the 5-minute expiry window has elapsed.

#### 1.2.11 UT-16 -- Verify OTP (No Pending OTP)

Ensure verification fails when no OTP has been sent to the given phone number.

#### 1.2.12 UT-17 -- Login (Valid Credentials with Username)

Verify that a registered user can log in using their username and password, and receives both access token (30-min expiry) and refresh token (7-day expiry).

#### 1.2.13 UT-18 -- Login (Valid Credentials with Email)

Ensure the system supports login using email address as an alternative to username.

#### 1.2.14 UT-19 -- Login (Invalid Password)

Verify that login with an incorrect password returns an "Invalid credentials" error.

#### 1.2.15 UT-20 -- Login (Non-Existent User)

Ensure login attempt with a non-registered username/email returns an appropriate error.

#### 1.2.16 UT-21 -- Login (Inactive Account)

Verify that login is rejected for deactivated user accounts with an "Account is deactivated" message.

#### 1.2.17 UT-22 -- Logout (Valid Token)

Ensure the logout endpoint blacklists the current access token and returns a success message.

#### 1.2.18 UT-23 -- Logout (Already Blacklisted Token)

Verify that attempting to use a blacklisted token for any API request returns a 401 Unauthorized error.

#### 1.2.19 UT-24 -- Token Refresh (Valid Refresh Token)

Verify that submitting a valid refresh token returns a new access token without requiring re-login.

#### 1.2.20 UT-25 -- Token Refresh (Invalid Token)

Ensure that an invalid or expired refresh token returns a "Could not validate credentials" error.

#### 1.2.21 UT-26 -- Token Refresh (Access Token Used as Refresh)

Verify that submitting an access token instead of a refresh token is rejected.

---

### 1.3 User Profile Management Unit Tests

#### 1.3.1 UT-27 -- Fetch Current User Profile

Verify that an authenticated user can retrieve their profile information (id, full_name, email, username, phone, is_active) via the `/auth/me` endpoint.

#### 1.3.2 UT-28 -- Unauthorized Profile Access

Ensure that accessing `/auth/me` without a valid Bearer token returns a 401 Unauthorized error.

#### 1.3.3 UT-29 -- Update Full Name

Validate that a user can update their full name through the `/auth/profile` endpoint and the change persists in `users.json`.

#### 1.3.4 UT-30 -- Update Email Address

Verify that email update works correctly and rejects duplicate email addresses already in use by another user.

#### 1.3.5 UT-31 -- Update Phone Number

Ensure phone number update validates Nepali format and rejects phone numbers already registered to another user.

#### 1.3.6 UT-32 -- Profile Update with Expired Token

Verify that profile update fails gracefully when the access token has expired.

---

### 1.4 Disease Detection Unit Tests

#### 1.4.1 UT-33 -- Disease Prediction (Valid Leaf Image)

Verify that uploading a valid leaf image (JPEG/PNG/WebP) to `/disease/predict` returns the disease name, confidence score, confidence percentage, health status flag, cause, and cure information.

#### 1.4.2 UT-34 -- Disease Prediction (Healthy Plant)

Ensure that a healthy leaf image returns `is_healthy: true` with the corresponding healthy classification label.

#### 1.4.3 UT-35 -- Disease Prediction (Diseased Plant)

Verify that a diseased leaf image returns `is_healthy: false` along with accurate disease identification, cause, and treatment recommendations from `disease_info.json`.

#### 1.4.4 UT-36 -- Disease Prediction (Invalid File Type)

Ensure uploading a non-image file (e.g., PDF, TXT) returns a validation error.

#### 1.4.5 UT-37 -- Disease Prediction (Oversized Image)

Verify that images exceeding the maximum file size limit (10MB) are rejected with an appropriate error.

#### 1.4.6 UT-38 -- Disease Prediction (Unauthenticated Request)

Ensure that the disease prediction endpoint requires valid JWT authentication and rejects unauthenticated requests with 401 status.

#### 1.4.7 UT-39 -- Disease Model 39-Class Coverage

Verify that the MobileNetV2 model correctly classifies inputs across all 39 plant disease and healthy classes covering 14 crop species (Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato).

#### 1.4.8 UT-40 -- Disease Confidence Score Accuracy

Ensure that the softmax probability output correctly represents prediction confidence and the percentage conversion is mathematically accurate.

---

### 1.5 Insect Detection Unit Tests

#### 1.5.1 UT-41 -- Insect Prediction (Valid Insect Image)

Verify that uploading a valid insect image to `/insect/predict` returns the insect name, confidence score, description, affected crops, damage details, prevention methods, and treatment recommendations.

#### 1.5.2 UT-42 -- Insect Prediction (Known Farm Pest)

Ensure that known pest species (e.g., Fall Armyworm, Colorado Beetle, Aphids) are correctly identified with high confidence from the 15 supported insect/pest classes.

#### 1.5.3 UT-43 -- Insect Prediction (Invalid File Type)

Verify that non-image files are rejected with appropriate error messages.

#### 1.5.4 UT-44 -- Insect Prediction (Unauthenticated Request)

Ensure the insect prediction endpoint enforces JWT authentication and returns 401 for unauthorized requests.

#### 1.5.5 UT-45 -- Insect Info Mapping

Verify that predicted insect names correctly map to detailed information (description, affected_crops, damage, prevention, treatment) from the `insect_info.json` data source.

---

### 1.6 Weed Detection Unit Tests

#### 1.6.1 UT-46 -- Weed Prediction from Image (Valid Field Image)

Verify that uploading a valid field image to `/weed/predict` returns bounding box predictions with crop/weed classifications, confidence scores, and a summary containing total detections, weed count, crop count, and weed percentage.

#### 1.6.2 UT-47 -- Weed Prediction (Crop vs Weed Classification)

Ensure the Roboflow model correctly distinguishes between crops (class_id: 0, label: "Crop", color: green) and weeds (class_id: 1, label: "Weed", color: red).

#### 1.6.3 UT-48 -- Weed Prediction (No Detections)

Verify that an image with no detectable crops or weeds returns an empty predictions array with zero counts in the summary.

#### 1.6.4 UT-49 -- Weed Prediction (Invalid File Type)

Ensure non-image file uploads are rejected with appropriate error messages.

#### 1.6.5 UT-50 -- Weed Prediction (Unauthenticated Request)

Verify that weed prediction requires valid JWT authentication.

#### 1.6.6 UT-51 -- Weed Prediction Bounding Box Structure

Validate that each prediction includes all required bounding box fields: x, y, width, height, confidence, class_id, label, and color.

#### 1.6.7 UT-52 -- Weed Percentage Calculation

Ensure the weed percentage calculation (weeds / total detections * 100) in the summary response is mathematically correct.

---

### 1.7 Real-Time Detection Unit Tests

#### 1.7.1 UT-53 -- Weed WebSocket Connection (Valid Token)

Verify that connecting to `/weed/stream` with a valid JWT token in the query parameter successfully establishes a WebSocket connection and begins frame streaming.

#### 1.7.2 UT-54 -- Weed WebSocket Connection (Invalid Token)

Ensure that connecting with an invalid or expired token results in an error message and connection closure.

#### 1.7.3 UT-55 -- Weed WebSocket Connection (Missing Token)

Verify that attempting WebSocket connection without a token parameter is rejected immediately.

#### 1.7.4 UT-56 -- Weed WebSocket Frame Streaming (JSON Metadata)

Validate that the server sends JSON messages containing frame_id, detections count, summary (total, weeds, crops, weed_percentage), and predictions array with correct bounding box data.

#### 1.7.5 UT-57 -- Weed WebSocket Frame Streaming (Binary JPEG Data)

Ensure that binary JPEG frames are sent alternating with JSON metadata and can be rendered on the client canvas.

#### 1.7.6 UT-58 -- Weed WebSocket Confidence Threshold Parameter

Verify that the `confidence` query parameter (range 0.1 to 0.95) correctly adjusts detection sensitivity during real-time weed streaming.

#### 1.7.7 UT-59 -- Weed WebSocket Custom Camera URL

Ensure that the `cam_url` query parameter overrides the default IP camera URL and connects to the specified camera source.

#### 1.7.8 UT-60 -- YOLO WebSocket Connection and Connected Message

Verify that connecting to `/realtime/detect` with a valid token sends a `"connected"` type message confirming stream initialization.

#### 1.7.9 UT-61 -- YOLO WebSocket Authentication Failure

Ensure invalid or expired tokens return an error message and prevent the YOLOv8 stream from starting.

#### 1.7.10 UT-62 -- YOLO WebSocket Frame Message Structure

Validate that each frame message includes type ("frame"), frame_id, detections count, class_counts dictionary, and size (byte length of JPEG).

#### 1.7.11 UT-63 -- YOLO WebSocket Binary Frame with Annotations

Verify that binary JPEG frames contain YOLOv8 bounding box annotations drawn on the original image.

#### 1.7.12 UT-64 -- YOLO WebSocket Class-Wise Object Counting

Ensure that `class_counts` correctly tallies each detected object class (e.g., person: 2, dog: 1) per frame.

#### 1.7.13 UT-65 -- YOLO WebSocket Confidence Threshold

Verify that the `confidence` parameter (default 0.45) filters out low-confidence detections from results.

#### 1.7.14 UT-66 -- YOLO WebSocket Camera Source Selection

Ensure the `source` parameter correctly switches between device webcam (index 0) and IP camera URL.

#### 1.7.15 UT-67 -- WebSocket Connection Drop Handling

Ensure the system handles camera disconnection gracefully by sending an error message and closing the WebSocket cleanly without crashing the server.

#### 1.7.16 UT-68 -- WebSocket Stream Cleanup on Client Disconnect

Verify that all resources (camera capture, model inference thread) are properly released when the WebSocket client disconnects.

---

### 1.8 Security and Token Management Unit Tests

#### 1.8.1 UT-69 -- Access Token Creation

Verify that `create_access_token()` generates a valid JWT with correct payload (sub, type, exp) using HS256 algorithm and 30-minute default expiry.

#### 1.8.2 UT-70 -- Refresh Token Creation

Ensure `create_refresh_token()` generates a token with 7-day expiry and "refresh" type in payload.

#### 1.8.3 UT-71 -- Token Decode (Valid Token)

Verify that `decode_token()` correctly extracts user ID and token type from a valid JWT.

#### 1.8.4 UT-72 -- Token Decode (Expired Token)

Ensure that decoding an expired JWT raises the appropriate credentials exception.

#### 1.8.5 UT-73 -- Token Decode (Tampered Token)

Verify that a token with a modified payload or invalid signature is rejected.

#### 1.8.6 UT-74 -- Password Hashing

Ensure `hash_password()` produces a valid Bcrypt hash that differs from the plaintext input.

#### 1.8.7 UT-75 -- Password Verification

Verify that `verify_password()` returns `True` for correct password and `False` for incorrect password.

#### 1.8.8 UT-76 -- Token Blacklisting

Ensure `blacklist_token()` adds a token to the in-memory blacklist and `is_token_blacklisted()` correctly identifies blacklisted tokens.

---

### 1.9 User Service Unit Tests

#### 1.9.1 UT-77 -- Create User

Verify that `create_user()` stores user data with a UUID, Bcrypt-hashed password, and `is_active: true` status in `users.json`.

#### 1.9.2 UT-78 -- Get User by Email

Ensure `get_user_by_email()` returns the correct user record for a given email address.

#### 1.9.3 UT-79 -- Get User by Username

Verify `get_user_by_username()` returns the correct user record for a given username.

#### 1.9.4 UT-80 -- Get User by Phone

Ensure `get_user_by_phone()` returns the correct user for a given phone number.

#### 1.9.5 UT-81 -- Get User by ID

Verify `get_user_by_id()` returns the correct user record for a given UUID.

#### 1.9.6 UT-82 -- Update User Fields

Ensure `update_user()` correctly modifies specified user fields and persists changes to `users.json`.

#### 1.9.7 UT-83 -- User Not Found

Verify that all lookup functions (`get_user_by_email`, `get_user_by_username`, `get_user_by_phone`, `get_user_by_id`) return `None` when no matching user exists.

---

### 1.10 OTP Service Unit Tests

#### 1.10.1 UT-84 -- OTP Generation

Verify that `generate_otp()` produces a random 6-digit numeric string.

#### 1.10.2 UT-85 -- OTP Storage

Ensure `store_otp()` correctly stores OTP with phone number, registration data, and 5-minute expiration timestamp in the in-memory OTP store.

#### 1.10.3 UT-86 -- OTP SMS Delivery

Verify that `send_otp_sms()` successfully calls the Aakash SMS API with correct parameters (token, recipient phone, OTP message body).

#### 1.10.4 UT-87 -- OTP Verification (Correct Code)

Ensure `verify_otp()` returns the stored registration data when the correct OTP is provided within the 5-minute window.

#### 1.10.5 UT-88 -- OTP Verification (Incorrect Code)

Verify that `verify_otp()` returns `None` or raises an error for an incorrect OTP code.

#### 1.10.6 UT-89 -- OTP Expiry Enforcement

Ensure that OTPs older than 5 minutes are rejected during verification and return an expiry error.

---

### 1.11 Schema Validation Unit Tests

#### 1.11.1 UT-90 -- UserRegisterRequest Validation (Valid Data)

Verify that valid registration data passes all Pydantic validators: full name (minimum 2 characters), username (minimum 3 characters, alphanumeric and underscore only), password (minimum 8 characters with at least 1 uppercase letter and 1 digit), and phone (10-digit Nepali format starting with 98/97/96).

#### 1.11.2 UT-91 -- UserRegisterRequest Validation (Invalid Data)

Ensure that each invalid field triggers the correct validation error message: short name, invalid username characters, weak password, and malformed phone number.

#### 1.11.3 UT-92 -- LoginRequest Validation

Verify that the login schema accepts both username and email formats in the username field.

#### 1.11.4 UT-93 -- Detection Response Schema Validation

Ensure that DiseasePredictionResponse, InsectPredictionResponse, and WeedPredictionResponse schemas correctly serialize model outputs with all required fields.

---

## 2. System Testing

System testing validates the complete integrated application using frontend workflows, ensuring end-to-end functionality across the React frontend and FastAPI backend.

### 2.1 Authentication Flow System Tests

#### 2.1.1 ST-01 -- User Registration and OTP Flow

Verify the complete registration workflow: user fills the registration form with full name, email, username, password, and phone number (Step 1) -> clicks submit -> system sends 6-digit OTP via SMS to the provided phone number -> user enters OTP in the six auto-focusing input fields (Step 2) -> account is created successfully -> user is redirected to the login page.

#### 2.1.2 ST-02 -- OTP Resend Flow

Validate that after the 2-minute countdown timer expires, the "Resend OTP" button becomes active, and clicking it sends a new OTP code to the user's phone while resetting the countdown timer.

#### 2.1.3 ST-03 -- OTP Copy-Paste Support

Ensure that users can paste a 6-digit OTP code into the first input field and all six input fields are automatically populated with the correct digits.

#### 2.1.4 ST-04 -- Registration Form Validation

Verify that the registration form displays real-time validation errors for invalid inputs: short name, invalid username, weak password, and incorrect phone format before allowing form submission.

#### 2.1.5 ST-05 -- Login Flow

Verify that entering valid credentials (username/email and password) on the login page results in successful authentication, access and refresh token storage in localStorage, user data persistence in AuthContext, and automatic redirect to the home dashboard.

#### 2.1.6 ST-06 -- Login Error Handling

Ensure that invalid login attempts display appropriate error toast notifications ("Invalid credentials" or "Account is deactivated") without redirecting the user.

#### 2.1.7 ST-07 -- Login Page 3D Background

Ensure the Three.js 3D plant scene renders correctly on the login page without blocking user interaction with the login form.

#### 2.1.8 ST-08 -- Unauthorized Access Handling

Verify that unauthenticated users attempting to access protected routes (`/home`, `/disease`, `/insect`, `/weed`, `/realtime`, `/profile`) are automatically redirected to the login page.

#### 2.1.9 ST-09 -- Logout Flow

Ensure clicking the logout button in the navbar calls the backend logout endpoint, clears all tokens and user data from localStorage, resets AuthContext state, and redirects the user to the login page.

#### 2.1.10 ST-10 -- Token Expiry Auto-Redirect

Verify that when a 401 Unauthorized response is received from any API call, the Axios response interceptor automatically clears localStorage and redirects the user to the login page.

---

### 2.2 Home Dashboard System Tests

#### 2.2.1 ST-11 -- Dashboard Load After Login

Verify that the home page loads correctly after login displaying the welcome section with animated text, feature cards for all four detection capabilities, and statistical counters.

#### 2.2.2 ST-12 -- Feature Card Navigation

Ensure clicking each feature card navigates to the correct page: "Disease Detection" to `/disease`, "Real-Time Detection" to `/realtime`, "Insect Detection" to `/insect`, and "Weed Detection" to `/weed`.

#### 2.2.3 ST-13 -- Animated Counters with Intersection Observer

Verify that statistical counters animate smoothly from zero to their target values when the counter section scrolls into the viewport, triggered by the Intersection Observer API.

#### 2.2.4 ST-14 -- Animated Plant Growth Canvas

Ensure the plant growth animation renders correctly on the HTML canvas element within the home page without performance issues.

---

### 2.3 Disease Detection System Tests

#### 2.3.1 ST-15 -- Image Upload via Click

Verify that clicking the upload area opens the native file picker, selecting a leaf image displays a preview in the upload zone, and the "Detect Disease" button becomes enabled.

#### 2.3.2 ST-16 -- Image Upload via Drag-and-Drop

Ensure dragging and dropping a leaf image into the upload zone displays the image preview correctly and enables the detection button.

#### 2.3.3 ST-17 -- Disease Detection End-to-End Workflow

Validate the full workflow: user uploads a leaf image -> clicks "Detect Disease" -> loading spinner appears during API call -> results panel displays with disease name, confidence score with color-coded progress bar, cause description, and cure/treatment recommendations.

#### 2.3.4 ST-18 -- Healthy Plant Result Display

Verify that when the MobileNetV2 model identifies a healthy plant, the results section displays a success indicator with the healthy classification label and general health tips instead of disease cause and cure.

#### 2.3.5 ST-19 -- Diseased Plant Result Display

Ensure that when a disease is detected, the results section displays the disease name, a color-coded confidence bar (green for high confidence, yellow for medium, red for low), the cause of the disease, and detailed treatment/cure recommendations.

#### 2.3.6 ST-20 -- Image Size Validation Error

Verify that attempting to upload an image exceeding 10MB displays an error toast notification informing the user of the file size limit.

#### 2.3.7 ST-21 -- Image Format Restriction

Ensure only supported image formats (JPEG, PNG, WebP) can be selected in the file picker and unsupported formats are prevented from upload.

---

### 2.4 Insect Detection System Tests

#### 2.4.1 ST-22 -- Insect Image Upload and Preview

Verify that uploading an insect/pest image displays a preview in the upload zone and enables the "Detect Insect" button.

#### 2.4.2 ST-23 -- Insect Detection End-to-End Workflow

Validate the complete flow: user uploads an insect image -> clicks detect -> loading spinner appears -> results display with insect name, confidence score, description, affected crops list, damage description, prevention methods, and treatment recommendations.

#### 2.4.3 ST-24 -- Quick Action Guide Display

Ensure the quick action guide section renders correctly below the detection results with actionable prevention and treatment steps formatted for farmer readability.

#### 2.4.4 ST-25 -- Insect Image Format and Size Validation

Verify that only supported image formats are accepted and oversized files display an appropriate error toast notification.

---

### 2.5 Weed Detection System Tests

#### 2.5.1 ST-26 -- Image Upload Mode Detection

Verify that uploading a field image in the image upload mode sends it to the Roboflow API and displays annotated bounding boxes with color coding (green for crops, red for weeds) along with a summary showing total detections, crop count, weed count, and weed percentage.

#### 2.5.2 ST-27 -- Real-Time Stream Mode Activation

Ensure switching to the real-time streaming mode reveals the IP camera URL input field, confidence threshold slider (range 0.3 to 0.95), and start/stop stream control buttons.

#### 2.5.3 ST-28 -- Weed Stream Start and Live Frame Display

Validate that entering a camera URL and clicking "Start Stream" establishes a WebSocket connection to `/weed/stream`, displays live annotated frames on the HTML canvas, and begins updating the detection metrics panel.

#### 2.5.4 ST-29 -- Weed Stream Confidence Threshold Control

Verify that adjusting the confidence threshold slider during an active stream dynamically changes detection sensitivity and immediately reflects in the live detections.

#### 2.5.5 ST-30 -- Live Metrics Dashboard Update

Ensure the live metrics panel updates in real time during weed streaming: frame count increments with each received frame, total detections accumulates, live crop and weed counts reflect the latest frame, peak weeds tracks the maximum weed count, and weed coverage percentage calculates correctly.

#### 2.5.6 ST-31 -- Weed Analytics Charts Rendering

Verify that all seven analytics charts render correctly during and after streaming: crop vs weed pie chart, crops and weeds over time line chart, weed coverage trend area chart, cumulative detections chart, confidence distribution bar chart, detection overview radar chart, and detections with weed percentage dual-axis chart.

#### 2.5.7 ST-32 -- Weed Stream Video Recording

Validate that clicking the record button during an active weed stream captures annotated frames as a downloadable WebM video file, and clicking stop recording triggers the file download.

#### 2.5.8 ST-33 -- Weed Stream CSV Export

Ensure the CSV export button generates and downloads a CSV file containing timestamped detection data (frame ID, crop count, weed count, weed percentage, confidence values) from the current streaming session.

#### 2.5.9 ST-34 -- Weed Stream Session Summary

Verify that stopping the weed stream displays a session summary panel showing total frames processed, total detections, average weed percentage, peak weed count, and session duration.

#### 2.5.10 ST-35 -- Live Detection List

Ensure the scrollable live detection list displays individual detection entries with labels, confidence scores, and bounding box coordinates updating in real time.

---

### 2.6 Real-Time Object Detection System Tests

#### 2.6.1 ST-36 -- Source Selection (Device Webcam)

Verify that selecting device webcam (index 0) as the detection source and clicking "Start Stream" successfully connects to the device camera and begins streaming YOLOv8-annotated frames.

#### 2.6.2 ST-37 -- Source Selection (IP Camera)

Ensure that entering a custom IP camera URL in the source input field and starting the stream establishes connection to the remote camera and displays annotated detection frames.

#### 2.6.3 ST-38 -- Real-Time Detection End-to-End Workflow

Validate the full workflow: user selects camera source -> adjusts confidence threshold -> clicks "Start Stream" -> WebSocket connection established -> annotated video frames display on canvas -> live object counts update -> per-class detection bars populate.

#### 2.6.4 ST-39 -- Live Object Counting Display

Verify that detected objects are listed in the object counting panel with per-class counts and progress bars that update dynamically with each received frame.

#### 2.6.5 ST-40 -- FPS Monitoring Display

Ensure the current FPS and average FPS metrics display correctly in the metrics panel and update continuously during active streaming.

#### 2.6.6 ST-41 -- Real-Time Analytics Charts Rendering

Verify that all seven analytics charts render correctly: object distribution pie chart, detections over time area chart, FPS performance line chart, composed chart with moving average overlay, cumulative detections area chart, performance overview radar chart, and FPS vs detection count dual-axis chart.

#### 2.6.7 ST-42 -- Real-Time Stream Video Recording

Validate that recording during real-time object detection captures the annotated canvas frames as a downloadable WebM video file.

#### 2.6.8 ST-43 -- Real-Time Stream CSV Export

Ensure detection data (timestamp, frame ID, detection count, per-class counts, FPS) can be exported as a downloadable CSV file during or after the streaming session.

#### 2.6.9 ST-44 -- Quick Setup Instructions

Verify that the quick setup instructions section displays correctly, guiding users through camera source configuration and stream control usage.

---

### 2.7 Profile Management System Tests

#### 2.7.1 ST-45 -- Profile Page Load

Verify that the profile page loads correctly and displays the logged-in user's information: full name, username (read-only), email, phone number, and account status (Active/Inactive badge) with a profile avatar icon.

#### 2.7.2 ST-46 -- Profile Edit Mode Activation

Ensure clicking the edit button toggles the profile into edit mode, enabling input fields for full name, email, and phone while keeping the username field read-only and non-editable.

#### 2.7.3 ST-47 -- Profile Update End-to-End Flow

Validate that modifying profile fields (full name, email, phone) and clicking save sends the PUT request to `/auth/profile`, displays a success toast notification, and immediately reflects the updated information on the profile page.

#### 2.7.4 ST-48 -- Cancel Profile Edit

Verify that clicking the cancel button during profile editing reverts all modified fields to their original saved values and exits edit mode.

#### 2.7.5 ST-49 -- Profile Update Validation

Ensure that submitting invalid data during profile update (duplicate email, invalid phone format) displays an appropriate error toast notification and does not save the changes.

---

### 2.8 Navigation and Layout System Tests

#### 2.8.1 ST-50 -- Navbar Rendering and Links

Verify that the sticky navigation bar displays the PlantGuard logo with application name, all navigation links (Home, Disease, Real-Time, Insect, Weed), the current user's name with avatar icon, and the logout button.

#### 2.8.2 ST-51 -- Active Page Highlighting

Ensure the navigation link corresponding to the currently active page is visually highlighted to indicate the user's current location within the application.

#### 2.8.3 ST-52 -- Responsive Layout (Mobile)

Verify that all pages render correctly on mobile viewports (< 768px) with proper content stacking, readable text, and touch-friendly interactive elements.

#### 2.8.4 ST-53 -- Responsive Layout (Tablet and Desktop)

Ensure all pages render correctly on tablet (768px - 1024px) and desktop (> 1024px) viewports with appropriate grid layouts and spacing.

#### 2.8.5 ST-54 -- Toast Notification System

Verify that React Hot Toast notifications display correctly for all user actions: success toasts for successful operations (login, registration, profile update, detection complete) and error toasts for failures (invalid input, server errors, file size exceeded).

#### 2.8.6 ST-55 -- Leaf Background Animation

Ensure the animated leaf background component renders on all pages without obstructing content or degrading page performance.

---

### 2.9 Cross-System Integration Tests

#### 2.9.1 ST-56 -- Frontend-Backend API Communication

Verify that all Axios API calls from the React frontend correctly attach the JWT Bearer token via the request interceptor and receive properly formatted JSON responses from the FastAPI backend.

#### 2.9.2 ST-57 -- Database Persistence Across Restarts

Ensure that user registration data persists correctly in `users.json` and remains accessible after both frontend and backend application restarts.

#### 2.9.3 ST-58 -- File Upload and Static File Serving

Verify that images uploaded through the disease, insect, and weed detection pages are stored in the backend `uploads` directory and can be served back correctly via the `/uploads` static route.

#### 2.9.4 ST-59 -- Authentication State Persistence on Refresh

Ensure that refreshing the browser page preserves the user's login state by reading access and refresh tokens from localStorage and rehydrating the AuthContext with the current user data.

#### 2.9.5 ST-60 -- WebSocket Connection with Token Authentication

Verify that WebSocket connections for both weed streaming (`/weed/stream`) and real-time detection (`/realtime/detect`) correctly authenticate using the JWT token passed as a query parameter from the frontend.

---

## Summary

| Testing Category | Test Count | Test ID Range  |
|------------------|------------|----------------|
| Unit Testing     | 93         | UT-01 to UT-93 |
| System Testing   | 60         | ST-01 to ST-60 |
| **Total**        | **153**    |                |

This comprehensive testing plan covers all critical components of the PlantGuard AI-Powered Agricultural Intelligence Platform, ensuring reliability and correctness across backend API endpoints, authentication and security mechanisms, AI/ML model inference, real-time WebSocket communication, and frontend user interface workflows.
