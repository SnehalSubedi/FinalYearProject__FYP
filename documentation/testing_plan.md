# Testing Plan

The testing strategy for the PlantGuard AI-Powered Agricultural Intelligence Platform is structured into four major categories: **Unit Testing**, **System Testing**, **WebSocket and Real-Time Testing**, and **AI/ML Model Testing**. This layered approach ensures validation of individual components, integrated workflows, real-time communication, and machine learning inference functionalities.

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

Ensure passwords that do not meet the minimum requirements (8 characters, 1 uppercase, 1 digit) are rejected during OTP request.

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

Verify that a diseased leaf image returns `is_healthy: false` along with accurate disease identification, cause, and treatment recommendations.

#### 1.4.4 UT-36 -- Disease Prediction (Invalid File Type)

Ensure uploading a non-image file (e.g., PDF, TXT) returns a validation error.

#### 1.4.5 UT-37 -- Disease Prediction (Oversized Image)

Verify that images exceeding the maximum file size limit (10MB) are rejected.

#### 1.4.6 UT-38 -- Disease Prediction (Unauthenticated Request)

Ensure that disease prediction endpoint requires valid authentication.

#### 1.4.7 UT-39 -- Disease Info Lookup

Verify that predicted disease names correctly map to detailed cause and cure information from the `disease_info.json` data source.

---

### 1.5 Insect Detection Unit Tests

#### 1.5.1 UT-40 -- Insect Prediction (Valid Insect Image)

Verify that uploading a valid insect image to `/insect/predict` returns the insect name, confidence score, description, affected crops, damage details, prevention methods, and treatment recommendations.

#### 1.5.2 UT-41 -- Insect Prediction (Known Farm Pest)

Ensure that known pest species (e.g., Fall Armyworm, Colorado Beetle, Aphids) are correctly identified with high confidence.

#### 1.5.3 UT-42 -- Insect Prediction (Invalid File Type)

Verify that non-image files are rejected with appropriate error messages.

#### 1.5.4 UT-43 -- Insect Prediction (Unauthenticated Request)

Ensure the insect prediction endpoint enforces JWT authentication.

#### 1.5.5 UT-44 -- Insect Info Lookup

Verify that predicted insect names correctly map to detailed information (description, affected crops, damage, prevention, treatment) from the `insect_info.json` data source.

---

### 1.6 Weed Detection Unit Tests

#### 1.6.1 UT-45 -- Weed Prediction from Image (Valid Field Image)

Verify that uploading a valid field image to `/weed/predict` returns bounding box predictions with crop/weed classifications, confidence scores, and a summary containing total detections, weed count, crop count, and weed percentage.

#### 1.6.2 UT-46 -- Weed Prediction (Crop vs Weed Classification)

Ensure the model correctly distinguishes between crops (class_id: 0, label: "Crop") and weeds (class_id: 1, label: "Weed") with appropriate color coding (green for crops, red for weeds).

#### 1.6.3 UT-47 -- Weed Prediction (No Detections)

Verify that an image with no detectable crops or weeds returns an empty predictions array with zero counts in the summary.

#### 1.6.4 UT-48 -- Weed Prediction (Invalid File Type)

Ensure non-image file uploads are rejected.

#### 1.6.5 UT-49 -- Weed Prediction (Unauthenticated Request)

Verify that weed prediction requires valid JWT authentication.

#### 1.6.6 UT-50 -- Weed Prediction Bounding Box Structure

Validate that each prediction includes correct bounding box fields: x, y, width, height, confidence, class_id, label, and color.

---

### 1.7 Security and Token Management Unit Tests

#### 1.7.1 UT-51 -- Access Token Creation

Verify that `create_access_token()` generates a valid JWT with correct payload (sub, type, exp) using HS256 algorithm.

#### 1.7.2 UT-52 -- Refresh Token Creation

Ensure `create_refresh_token()` generates a token with 7-day expiry and "refresh" type in payload.

#### 1.7.3 UT-53 -- Token Decode (Valid Token)

Verify that `decode_token()` correctly extracts user ID and token type from a valid JWT.

#### 1.7.4 UT-54 -- Token Decode (Expired Token)

Ensure that decoding an expired JWT raises appropriate credentials exception.

#### 1.7.5 UT-55 -- Token Decode (Tampered Token)

Verify that a token with modified payload or invalid signature is rejected.

#### 1.7.6 UT-56 -- Password Hashing

Ensure `hash_password()` produces a valid Bcrypt hash that differs from the plaintext input.

#### 1.7.7 UT-57 -- Password Verification

Verify that `verify_password()` returns `True` for correct password and `False` for incorrect password.

#### 1.7.8 UT-58 -- Token Blacklisting

Ensure `blacklist_token()` adds a token to the blacklist and `is_token_blacklisted()` correctly identifies blacklisted tokens.

---

### 1.8 User Service Unit Tests

#### 1.8.1 UT-59 -- Create User

Verify that `create_user()` stores user data with a UUID, hashed password, and active status in `users.json`.

#### 1.8.2 UT-60 -- Get User by Email

Ensure `get_user_by_email()` returns the correct user record for a given email address.

#### 1.8.3 UT-61 -- Get User by Username

Verify `get_user_by_username()` returns the correct user record.

#### 1.8.4 UT-62 -- Get User by Phone

Ensure `get_user_by_phone()` returns the correct user for a given phone number.

#### 1.8.5 UT-63 -- Get User by ID

Verify `get_user_by_id()` returns the correct user record for a given UUID.

#### 1.8.6 UT-64 -- Update User Fields

Ensure `update_user()` correctly modifies user fields and persists changes to `users.json`.

#### 1.8.7 UT-65 -- User Not Found

Verify that lookup functions return `None` when no matching user exists.

---

### 1.9 OTP Service Unit Tests

#### 1.9.1 UT-66 -- OTP Generation

Verify that `generate_otp()` produces a 6-digit numeric string.

#### 1.9.2 UT-67 -- OTP Storage

Ensure `store_otp()` correctly stores OTP with phone number, registration data, and 5-minute expiration timestamp.

#### 1.9.3 UT-68 -- OTP SMS Delivery

Verify that `send_otp_sms()` successfully calls the Aakash SMS API with correct parameters (token, recipient phone, OTP message).

#### 1.9.4 UT-69 -- OTP Verification (Correct Code)

Ensure `verify_otp()` returns the stored registration data when the correct OTP is provided.

#### 1.9.5 UT-70 -- OTP Verification (Incorrect Code)

Verify that `verify_otp()` returns `None` or raises error for incorrect OTP.

#### 1.9.6 UT-71 -- OTP Expiry Enforcement

Ensure that OTPs older than 5 minutes are rejected during verification.

---

### 1.10 Schema Validation Unit Tests

#### 1.10.1 UT-72 -- UserRegisterRequest Validation (Valid Data)

Verify that valid registration data passes all Pydantic validators (name >= 2 chars, username >= 3 chars alphanumeric, password >= 8 chars with uppercase and digit, phone 10-digit Nepali format).

#### 1.10.2 UT-73 -- UserRegisterRequest Validation (Invalid Data)

Ensure that each invalid field triggers the correct validation error message.

#### 1.10.3 UT-74 -- LoginRequest Validation

Verify that login schema accepts both username and email formats.

#### 1.10.4 UT-75 -- Detection Response Schema Validation

Ensure that DiseasePredictionResponse, InsectPredictionResponse, and WeedPredictionResponse schemas correctly serialize model outputs.

---

## 2. System Testing

System testing validates the complete integrated application using frontend workflows, ensuring end-to-end functionality across the React frontend and FastAPI backend.

### 2.1 Authentication Flow System Tests

#### 2.1.1 ST-01 -- User Registration and OTP Flow

Verify the complete registration workflow: user fills registration form (Step 1) -> submits -> receives SMS OTP -> enters 6-digit OTP in auto-focusing input fields (Step 2) -> account is created -> user is redirected to login page.

#### 2.1.2 ST-02 -- OTP Resend Flow

Validate that after the 2-minute countdown timer expires, the user can click "Resend OTP" to receive a new code, and the timer resets.

#### 2.1.3 ST-03 -- OTP Copy-Paste Support

Ensure that users can paste a 6-digit OTP code and all six input fields are automatically populated.

#### 2.1.4 ST-04 -- Login Flow

Verify that entering valid credentials on the login page results in successful authentication, token storage in localStorage, and redirect to the home dashboard.

#### 2.1.5 ST-05 -- Login with 3D Background

Ensure the 3D plant scene (Three.js) renders correctly on the login page without blocking user interaction.

#### 2.1.6 ST-06 -- Unauthorized Access Handling

Verify that unauthenticated users attempting to access protected routes (home, disease, insect, weed, realtime, profile) are automatically redirected to the login page.

#### 2.1.7 ST-07 -- Logout Flow

Ensure clicking the logout button clears localStorage, invalidates the token, and redirects to the login page.

#### 2.1.8 ST-08 -- Token Expiry Handling

Verify that when a 401 response is received from any API call, the Axios interceptor clears storage and redirects the user to login.

---

### 2.2 Home Dashboard System Tests

#### 2.2.1 ST-09 -- Dashboard Load

Verify that the home page loads correctly after login with animated welcome content, feature cards, and animated counters.

#### 2.2.2 ST-10 -- Feature Card Navigation

Ensure clicking each feature card (Disease Detection, Real-Time Detection, Insect Detection, Weed Detection) navigates to the corresponding page.

#### 2.2.3 ST-11 -- Animated Counters

Verify that statistical counters animate from zero to target values using intersection observer when scrolled into view.

#### 2.2.4 ST-12 -- Animated Plant Growth Canvas

Ensure the plant growth animation renders correctly on the home page canvas element.

---

### 2.3 Disease Detection System Tests

#### 2.3.1 ST-13 -- Image Upload via Click

Verify that clicking the upload area opens a file picker, the selected image is previewed, and the "Detect Disease" button becomes active.

#### 2.3.2 ST-14 -- Image Upload via Drag-and-Drop

Ensure dragging and dropping a leaf image into the upload zone displays the preview correctly.

#### 2.3.3 ST-15 -- Disease Detection Workflow

Validate the full workflow: upload image -> click "Detect Disease" -> loading spinner appears -> results display with disease name, confidence bar, cause, and cure.

#### 2.3.4 ST-16 -- Healthy Plant Result Display

Verify that healthy plant detections show a success indicator with health tips instead of disease information.

#### 2.3.5 ST-17 -- Diseased Plant Result Display

Ensure diseased plant results display the disease name, color-coded confidence bar, cause description, and treatment recommendations.

#### 2.3.6 ST-18 -- Image Size Validation

Verify that uploading an image exceeding 10MB shows an appropriate error toast notification.

---

### 2.4 Insect Detection System Tests

#### 2.4.1 ST-19 -- Insect Image Upload and Preview

Verify that uploading an insect/pest image displays a preview and enables the detection button.

#### 2.4.2 ST-20 -- Insect Detection Workflow

Validate the complete flow: upload -> detect -> results display with insect name, confidence, affected crops, damage description, prevention, and treatment.

#### 2.4.3 ST-21 -- Quick Action Guide

Ensure the quick action guide section renders correctly with actionable prevention and treatment steps for farmers.

---

### 2.5 Weed Detection System Tests

#### 2.5.1 ST-22 -- Image Upload Mode

Verify that uploading a field image in image mode displays crop/weed bounding boxes with color coding and a summary with weed percentage.

#### 2.5.2 ST-23 -- Real-Time Stream Mode Activation

Ensure switching to real-time mode displays IP camera URL input, confidence threshold slider, and start/stop controls.

#### 2.5.3 ST-24 -- Weed Stream Start and Frame Display

Validate that entering a camera URL and clicking "Start Stream" establishes a WebSocket connection, displays live frames on canvas, and updates detection metrics.

#### 2.5.4 ST-25 -- Weed Stream Controls

Verify confidence threshold slider (range 0.3 to 0.95) dynamically adjusts detection sensitivity during streaming.

#### 2.5.5 ST-26 -- Live Metrics Dashboard

Ensure real-time metrics update correctly during streaming: frame count, total detections, live crop/weed counts, peak weeds, and weed coverage percentage.

#### 2.5.6 ST-27 -- Analytics Charts Rendering

Verify that all analytics charts render correctly during and after streaming: pie chart, line chart, area chart, cumulative detections, confidence distribution bar chart, radar chart, and dual-axis chart.

#### 2.5.7 ST-28 -- Video Recording

Validate that clicking the record button captures the stream as a WebM video file and allows download.

#### 2.5.8 ST-29 -- CSV Export

Ensure the CSV export button generates a downloadable file containing detection data from the current session.

#### 2.5.9 ST-30 -- Session Summary

Verify that stopping the stream displays a session summary with aggregated statistics.

---

### 2.6 Real-Time Detection System Tests

#### 2.6.1 ST-31 -- Source Selection (Device Webcam)

Verify that selecting device webcam (index 0) as the source successfully connects and starts streaming.

#### 2.6.2 ST-32 -- Source Selection (IP Camera)

Ensure entering a custom IP camera URL and starting the stream establishes connection and displays frames.

#### 2.6.3 ST-33 -- Real-Time Detection Workflow

Validate the full workflow: select source -> configure confidence -> start stream -> view annotated frames with bounding boxes -> see live object counts.

#### 2.6.4 ST-34 -- Live Object Counting Display

Verify that detected objects are listed with per-class counts and progress bars that update in real time.

#### 2.6.5 ST-35 -- FPS Monitoring

Ensure current FPS and average FPS metrics display correctly and update during streaming.

#### 2.6.6 ST-36 -- Real-Time Analytics Charts

Verify all charts render: object distribution pie chart, detections over time area chart, FPS performance line chart, composed chart with moving average, cumulative detections, radar chart, and dual-axis chart.

#### 2.6.7 ST-37 -- Stream Video Recording

Validate that recording during real-time detection captures annotated frames as a downloadable WebM file.

#### 2.6.8 ST-38 -- Stream CSV Export

Ensure detection data can be exported as a CSV file during or after the stream session.

---

### 2.7 Profile Management System Tests

#### 2.7.1 ST-39 -- Profile Page Load

Verify that the profile page displays the logged-in user's information (full name, username, email, phone, account status) with a profile avatar icon.

#### 2.7.2 ST-40 -- Profile Edit Mode

Ensure clicking the edit button enables editable fields for full name, email, and phone while keeping username read-only.

#### 2.7.3 ST-41 -- Profile Update Flow

Validate that modifying profile fields and clicking save sends the update request, displays a success toast, and reflects the changes immediately.

#### 2.7.4 ST-42 -- Cancel Profile Edit

Verify that clicking cancel during editing reverts all fields to their original values.

---

### 2.8 Navigation and Layout System Tests

#### 2.8.1 ST-43 -- Navbar Rendering

Verify that the navigation bar displays the logo, navigation links (Home, Disease, Real-Time, Insect, Weed), current user info with avatar, and logout button.

#### 2.8.2 ST-44 -- Active Page Highlighting

Ensure the current page link is visually highlighted in the navbar.

#### 2.8.3 ST-45 -- Responsive Layout

Verify that all pages render correctly on mobile, tablet, and desktop viewports.

#### 2.8.4 ST-46 -- Toast Notifications

Ensure success and error toast notifications display correctly for all user actions across the application.

---

### 2.9 Cross-System Integration Tests

#### 2.9.1 ST-47 -- Frontend-Backend API Communication

Verify that all Axios API calls correctly attach the JWT Bearer token and receive expected responses from FastAPI endpoints.

#### 2.9.2 ST-48 -- Database Persistence

Ensure that user registration data persists correctly in `users.json` and survives application restarts.

#### 2.9.3 ST-49 -- File Upload and Storage

Verify that uploaded images are stored in the `uploads` directory and served correctly via the static file route.

#### 2.9.4 ST-50 -- Authentication State Persistence

Ensure that refreshing the browser preserves the login state by reading tokens from localStorage and rehydrating the AuthContext.

---

## 3. WebSocket and Real-Time Testing

WebSocket testing validates the real-time bidirectional communication between the frontend and backend for live detection features.

### 3.1 Weed Detection WebSocket Tests

#### 3.1.1 WS-01 -- WebSocket Connection (Valid Token)

Verify that connecting to `/weed/stream` with a valid JWT token in the query parameter successfully establishes a WebSocket connection and begins frame streaming.

#### 3.1.2 WS-02 -- WebSocket Connection (Invalid Token)

Ensure that connecting with an invalid or expired token results in an error message and connection closure.

#### 3.1.3 WS-03 -- WebSocket Connection (Missing Token)

Verify that attempting connection without a token parameter is rejected.

#### 3.1.4 WS-04 -- Frame Streaming (JSON Metadata)

Validate that the server sends JSON messages containing frame_id, detections count, summary (total, weeds, crops, weed_percentage), and predictions array with correct bounding box data.

#### 3.1.5 WS-05 -- Frame Streaming (Binary JPEG Data)

Ensure that binary JPEG frames are sent alternating with JSON metadata and can be rendered on the client canvas.

#### 3.1.6 WS-06 -- Confidence Threshold Parameter

Verify that the `confidence` query parameter (range 0.1 to 0.95) correctly adjusts detection sensitivity in real time.

#### 3.1.7 WS-07 -- Custom Camera URL Parameter

Ensure that the `cam_url` query parameter overrides the default IP camera URL and connects to the specified source.

#### 3.1.8 WS-08 -- Frame Rate Control

Verify that frames are delivered at the configured target FPS (2 FPS for weed detection) without significant deviation.

#### 3.1.9 WS-09 -- Connection Drop Handling

Ensure the system handles camera disconnection gracefully by sending an error message and closing the WebSocket cleanly.

#### 3.1.10 WS-10 -- Multiple Concurrent Connections

Verify that the server handles multiple simultaneous WebSocket connections for weed detection without performance degradation.

---

### 3.2 YOLOv8 Real-Time WebSocket Tests

#### 3.2.1 WS-11 -- WebSocket Connection and Connected Message

Verify that connecting to `/realtime/detect` with a valid token sends a `"connected"` type message confirming stream initialization.

#### 3.2.2 WS-12 -- WebSocket Authentication Failure

Ensure invalid tokens return an error message and prevent stream from starting.

#### 3.2.3 WS-13 -- Frame Message Structure

Validate that each frame message includes type ("frame"), frame_id, detections count, class_counts dictionary, and size (byte length of JPEG).

#### 3.2.4 WS-14 -- Binary Frame with Annotations

Verify that binary JPEG frames contain YOLOv8 bounding box annotations drawn on the original image.

#### 3.2.5 WS-15 -- Class-Wise Object Counting

Ensure that `class_counts` correctly tallies each detected object class (e.g., person: 2, dog: 1) per frame.

#### 3.2.6 WS-16 -- Confidence Threshold Adjustment

Verify that the `confidence` parameter (default 0.45) filters out low-confidence detections from results.

#### 3.2.7 WS-17 -- Camera Source Selection

Ensure the `source` parameter correctly switches between device webcam (index 0) and IP camera URL.

#### 3.2.8 WS-18 -- Target FPS Configuration

Verify that frames are delivered at approximately the configured target FPS (15 FPS default) for smooth real-time display.

#### 3.2.9 WS-19 -- Auto-Reconnect on Camera Failure

Ensure the YOLO service handles camera disconnection and attempts reconnection with appropriate error messages.

#### 3.2.10 WS-20 -- Stream Cleanup on Disconnect

Verify that all resources (camera capture, model inference) are properly released when the WebSocket client disconnects.

---

## 4. AI/ML Model Testing

AI/ML model testing validates the accuracy, performance, and reliability of the machine learning models integrated into the PlantGuard platform.

### 4.1 Plant Disease Detection Model Tests (MobileNetV2)

#### 4.1.1 ML-01 -- Model Loading

Verify that the HuggingFace MobileNetV2 model (`linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`) and its image processor load successfully at application startup.

#### 4.1.2 ML-02 -- Image Preprocessing

Ensure input images are correctly processed by MobileNetV2ImageProcessor (resizing, normalization, tensor conversion) before inference.

#### 4.1.3 ML-03 -- 39-Class Classification

Verify that the model correctly classifies inputs across all 39 plant disease/healthy classes covering 14 crop species (Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato).

#### 4.1.4 ML-04 -- Confidence Score Accuracy

Ensure that the softmax probability output correctly represents prediction confidence and the percentage conversion is accurate.

#### 4.1.5 ML-05 -- Healthy vs Diseased Classification

Verify that the `is_healthy` flag is correctly derived from the predicted class label (True when label contains "healthy").

#### 4.1.6 ML-06 -- Disease Info Mapping

Ensure that predicted class names correctly map to cause and cure information from `disease_info.json`, with fallback values when no match is found.

#### 4.1.7 ML-07 -- Class Names Loading

Verify that `class_names.json` loads all 39 class labels correctly and indices match model output logits.

---

### 4.2 Insect Detection Model Tests (Vision Transformer)

#### 4.2.1 ML-08 -- ViT Model Loading

Verify that the HuggingFace Vision Transformer model (`dima806/farm_insects_image_detection`) loads successfully.

#### 4.2.2 ML-09 -- 15-Class Insect Classification

Ensure the model correctly classifies all 15 farm insect/pest types: Fall Armyworms, Colorado Beetles, Aphids, Stem Borers, Bollworms, Grasshoppers, Mites, Mosquitoes, Sawflies, Lady Beetles, Fruit Flies, Bees, Ants, Wasps, and Moths.

#### 4.2.3 ML-10 -- Insect Info Mapping

Verify that predicted insect names correctly map to detailed information (description, affected_crops, damage, prevention, treatment) from `insect_info.json`.

#### 4.2.4 ML-11 -- Confidence Threshold Behavior

Ensure that low-confidence predictions still return valid insect names with appropriate confidence scores.

---

### 4.3 Weed Detection Model Tests (Roboflow)

#### 4.3.1 ML-12 -- Roboflow API Connectivity

Verify that the Roboflow serverless API (`crop-and-weed-detection-gacus/1`) is reachable and responds with valid detection data.

#### 4.3.2 ML-13 -- Crop/Weed Binary Classification

Ensure the model correctly distinguishes between crops (class 0) and weeds (class 1) in field images.

#### 4.3.3 ML-14 -- Bounding Box Accuracy

Verify that returned bounding boxes (x, y, width, height) correctly localize detected crops and weeds in the image.

#### 4.3.4 ML-15 -- Weed Percentage Calculation

Ensure the weed percentage calculation (weeds / total detections * 100) is mathematically correct.

#### 4.3.5 ML-16 -- Color Coding Assignment

Verify that crops are assigned green color (`#22c55e`) and weeds are assigned red color (`#ef4444`) in the response.

#### 4.3.6 ML-17 -- Confidence-Based Filtering

Ensure that the confidence threshold parameter correctly filters detections below the specified threshold.

#### 4.3.7 ML-18 -- Streaming Frame Processing

Verify that continuous frame processing from IP camera maintains consistent detection quality without memory leaks.

---

### 4.4 YOLOv8 Object Detection Model Tests

#### 4.4.1 ML-19 -- YOLOv8 Nano Model Loading

Verify that the YOLOv8 Nano model (`yolov8n.pt`) loads successfully from the Ultralytics framework.

#### 4.4.2 ML-20 -- COCO 80-Class Detection

Ensure the model detects objects across the full COCO dataset (80 classes including person, car, bicycle, dog, cat, etc.) in video frames.

#### 4.4.3 ML-21 -- Bounding Box Annotation

Verify that detected objects are annotated with bounding boxes and class labels drawn directly on the output JPEG frames.

#### 4.4.4 ML-22 -- Per-Frame Detection Counting

Ensure that per-frame class counts accurately reflect the number of each object type detected in the frame.

#### 4.4.5 ML-23 -- Confidence Threshold Filtering

Verify that the configurable confidence threshold (default 0.45) correctly filters low-confidence detections.

#### 4.4.6 ML-24 -- Real-Time Performance

Ensure the YOLOv8 Nano model maintains adequate inference speed (>= 15 FPS) for real-time video processing.

#### 4.4.7 ML-25 -- Frame Encoding Quality

Verify that output JPEG frames maintain sufficient visual quality for human interpretation while keeping file size manageable for WebSocket transmission.

---

## Summary

| Testing Category                   | Test Count | Test ID Range     |
|------------------------------------|------------|-------------------|
| Unit Testing                       | 75         | UT-01 to UT-75    |
| System Testing                     | 50         | ST-01 to ST-50    |
| WebSocket and Real-Time Testing    | 20         | WS-01 to WS-20   |
| AI/ML Model Testing               | 25         | ML-01 to ML-25    |
| **Total**                          | **170**    |                   |

This comprehensive testing plan covers all critical components of the PlantGuard platform, ensuring reliability and correctness across authentication, AI-powered detection, real-time streaming, and user interface workflows.
