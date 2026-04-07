# MultiplyX Feature Requirements

## Overview

MultiplyX is a multiplication practice game with a student-focused frontend and a lightweight backend that serves random multiplication questions.

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
6. User answers multiplication questions in a continuous gameplay loop.
7. User sees a results screen at the end of a timed Garage session.

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
- Shows summary info cards for questions played and current question.
- Shows a subtle `Next up:` preview using a prefetched backend question.
- Shows the current multiplication question as the main visual focus.
- Shows an answer input field.
- Shows an on-screen number pad.
- Uses answer-state color changes for idle, correct, wrong, and timeout states.
- Shows a feedback panel for answer outcomes and guidance.

### Number Pad and Input Behavior

- The number pad is always visible during gameplay.
- The number pad includes:
- digits `1-9`
- digit `0`
- `C` for clear
- `✓ Submit` for answer submission

- `C` clears the entire current input.
- `✓ Submit` triggers the same answer-check logic as manual submission.
- There is no backspace key.
- There is no separate `Check Answer` button.
- Keyboard `Enter` also submits the current answer.

### Answer Handling

- Correct answer:
- Adds 10 score points.
- Adds 5 coins.
- Increases streak by 1.
- Increases correct answer count by 1.
- Updates best streak when a new highest streak is reached.
- Sets the answer state to `correct`.
- Immediately advances to the next question.

- Wrong answer:
- Resets streak to 0.
- Deducts 2 coins, but never below 0.
- Shows the correct answer in feedback.
- Sets the answer state to `wrong`.
- Immediately advances to the next question.

- Timeout:
- Sets the answer state to `timeout`.
- Shows timeout feedback.
- In Garage mode, immediately ends the session and moves to the results screen.

### Session Persistence

- Student name, avatar, and selected mode are saved in browser local storage.
- Saved session data is restored after the page mounts.
- The user can continue the previous session from the home screen.
- Back to Home clears the saved session.

## Gameplay State Tracking

- `score` is tracked during gameplay.
- `coins` are tracked during gameplay.
- `streak` is tracked during gameplay.
- `bestStreak` tracks the highest streak reached in the current session.
- `questionsAnswered` tracks all answered or advanced questions shown during play.
- `correctAnswersCount` tracks only correctly answered questions.

## Results Screen

- Results are speed-first rather than score-first.
- Primary metric:
- `Speed`
- formula: `correctAnswersCount / 60`
- displayed to 2 decimal places
- labeled as `correct answers per second`

- Secondary metric:
- `Correct Answers`
- shows the total number of correctly answered questions

- Supporting stats:
- Coins Earned
- Questions Played
- Best Streak

- Mode Summary remains visible.
- Score is still shown as supporting context, but not as the primary results metric.
- Provides actions for `Play Again` and `Back to Home`.

## Game Modes

### Garage Mode

- Uses a single overall round timer of 60 seconds.
- The timer does not reset for each question.
- Questions continue indefinitely until the 60-second timer ends.
- When time reaches zero, the game shows timeout feedback and then immediately moves to the results screen.

### Jamming Mode

- Has no timer.
- Questions continue indefinitely.
- The learner can keep answering questions without a hard question-count cap.

## Question Flow Requirements

- Questions are fetched from the backend endpoint `http://127.0.0.1:5001/question`.
- Each question response includes:
- `question`: a string such as `3 x 4`
- `answer`: the numeric answer

- The next question is prefetched while the current question is on screen.
- The `Next up:` label shows the prefetched question.
- Advancing to the next question uses the prefetched question when available.
- After each question is shown, another next question is prefetched.
- The total number of questions is not fixed.

## Gameplay Animations

- Micro-animations are state-driven and tied to the current answer status.

### Correct Answer Animation

- The current question shows a short pop/glow effect.
- The feedback panel shows a soft success highlight.

### Wrong Answer Animation

- The current question shows a short shake effect.
- The feedback panel shows a subtle red error flash.

### Timeout Animation

- The current question shows a warning-style pulse.
- The feedback panel shows a timeout pulse that is visually different from the wrong-answer state.

### Animation Reset Behavior

- Animations reset when the next question is shown.
- The answer state is reset to `idle` on the next question.

## Responsive Layout Requirements

- The game screen is designed to work across:
- small phones
- larger phones
- tablets
- desktop screens

- The game layout remains vertical and game-focused.
- The current question remains the visual focus at every screen size.
- The num pad is touch-friendly across all breakpoints.
- The game container uses responsive max widths and spacing.
- Typography, padding, gaps, and button sizing scale by breakpoint.
- The game should remain usable without horizontal overflow on small screens.

### Touch-Friendly UI Goals

- Large tap targets for num pad buttons.
- Larger answer input field on bigger screens.
- Clear visual distinction between number keys, clear, and submit actions.
- Comfortable spacing between question, input, num pad, stats, and feedback.

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
- The gameplay area uses soft gradients and layered cards to keep the current question visually prominent.
- Gameplay feedback uses color coding:
- Blue for neutral/idle.
- Green for correct.
- Red for wrong.
- Orange for timeout.

## Known Product Intent

- Teacher and Parent experiences are planned but not yet implemented.
- Current development is focused on the student gameplay loop.
