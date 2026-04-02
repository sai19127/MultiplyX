# MultiplyX Feature Requirements

## Overview

MultiplyX is a multiplication practice game with a student-focused front end and a lightweight backend that serves random multiplication questions.

## Current Product Scope

### User Roles

- Student mode is implemented.
- Teacher mode is visible on the home screen as a coming soon option.
- Parent mode is visible on the home screen as a coming soon option.

### Student Journey

1. User lands on the home screen.
2. User chooses the student path.
3. User selects a speed name from a predefined list.
4. User selects an avatar.
5. User chooses a play mode.
6. User plays multiplication questions.
7. User sees a results screen at the end of a timed Garage session or when leaving the round flow.

## Frontend Features

### Home Screen

- Displays the MultiplyX title and learning message.
- Shows actions for Student, Teacher, and Parent.
- Teacher and Parent buttons display a coming soon message.
- Displays a continue previous session button when saved student session data exists.

### Student Login

- Allows the learner to choose a speed name from a predefined dropdown.
- Continue action is disabled until a speed name is selected.

### Avatar Selection

- Allows the learner to choose one avatar from a predefined avatar set.
- Continue action is disabled until an avatar is selected.

### Mode Selection

- Greets the learner using the selected speed name and avatar.
- Offers two play modes:
- `Garage`: timed quick-fire practice.
- `Jamming`: relaxed untimed practice.

### Gameplay Screen

- Shows student name and avatar.
- Shows mode, current question number, score, coins, streak, and Garage timer when relevant.
- Shows a `Next up:` preview using a prefetched backend question.
- Shows the current multiplication question.
- Shows an answer input field.
- Shows an on-screen number pad with keys `1-9`, `0`, `Clear`, and `Next`.
- Uses answer-state color changes for idle, correct, wrong, and timeout states.
- Shows a feedback panel for answer outcomes and guidance.

### Number Pad and Input Behavior

- The number pad is always visible during gameplay.
- `Clear` resets the current input.
- `Next` skips the current question and advances immediately.
- There is no separate `Check Answer` button.
- Answer validation happens automatically when the typed answer reaches the digit length of the correct answer.

### Answer Handling

- Correct answer:
- Adds 10 score points.
- Adds 5 coins.
- Increases streak by 1.
- Shows success feedback.
- Automatically advances to the next question after a short delay.

- Wrong answer:
- Resets streak to 0.
- Deducts 2 coins, but never below 0.
- Shows the correct answer in feedback.
- Automatically advances to the next question after a short delay.

- Manual skip:
- Increases questions played count.
- Resets streak to 0.
- Advances to the next question.

### Session Persistence

- Student name, avatar, and selected mode are saved in browser local storage.
- Saved session data is restored after the page mounts.
- The user can continue the previous session from the home screen.
- Back to Home clears the saved session.

### Results Screen

- Shows final score.
- Shows total coins earned.
- Shows number of questions played.
- Shows selected mode summary.
- Provides actions for `Play Again` and `Back to Home`.

## Game Modes

### Garage Mode

- Uses a single overall round timer of 60 seconds.
- The timer does not reset for each question.
- Questions continue indefinitely until the 60-second timer ends.
- When time reaches zero, the game shows timeout feedback and then moves to the results screen.

### Jamming Mode

- Has no timer.
- Questions continue indefinitely.
- The learner can keep answering or skipping questions without a hard question-count cap.

## Question Flow Requirements

- Questions are fetched from the backend endpoint `http://127.0.0.1:5001/question`.
- Each question response includes:
- `question`: a string such as `3 x 4`
- `answer`: the numeric answer

- The next question is prefetched while the current question is on screen.
- The `Next up:` label shows the prefetched question.
- Advancing to the next question should use the prefetched question when available.
- After each question is shown, another next question should be prefetched.
- The total number of questions is not fixed.

## Backend Features

### API

- `GET /`
- Returns a simple health/status response.

- `GET /question`
- Generates two random integers from 1 to 10.
- Returns a multiplication question in JSON format.

### Backend Constraints

- Backend listens on `127.0.0.1:5001`.
- Backend supports CORS.
- Backend must remain unchanged when frontend-only features are added.

## Current Visual and Interaction Requirements

- The app uses a bright, playful gradient background.
- The interface is card-based with rounded corners and prominent buttons.
- Gameplay feedback uses color coding:
- Blue for neutral/idle.
- Green for correct.
- Red for wrong.
- Orange for timeout.

## Known Product Intent

- Teacher and Parent experiences are planned but not yet implemented.
- Current development is focused on the student gameplay loop.

