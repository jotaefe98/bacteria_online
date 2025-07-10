# 🧪 Treatment Cards Implementation

## Overview

This document describes the implementation of the 5 special treatment cards in the Virus! game, including their rules, effects, and user interface behaviors.

## Treatment Types

### 🫀 TRANSPLANT (Red)

**Effect**: Exchange one organ between two players

**Rules**:

- Cannot exchange immunized organs
- Neither player can end up with two organs of the same color
- Works with any organ status (healthy, infected, vaccinated)

**UI Requirements**:

- Must select exactly 2 organs from different players
- Visual feedback shows both selected organs
- Validation prevents invalid selections

**Implementation**:

- Color: `red`
- Selection: Two organs (one per player)
- Server validation: Checks immunization and color conflicts

### 🦹‍♂️ ORGAN THIEF (Green)

**Effect**: Steal an organ from another player

**Rules**:

- Cannot steal immunized organs
- Cannot steal from yourself
- Cannot result in duplicate organ colors for thief
- Can steal healthy, infected, or vaccinated organs

**UI Requirements**:

- Must select exactly 1 organ from another player
- Cannot select own organs
- Shows clear "steal" indication

**Implementation**:

- Color: `green`
- Selection: One organ (not from current player)
- Server validation: Checks immunization and color conflicts

### 🧫 CONTAGION (Blue)

**Effect**: Transfer viruses randomly to other players

**Rules**:

- Only affects healthy (completely free) organs
- Cannot infect vaccinated or already infected organs
- Transfers one virus per infected organ you have
- Targets are chosen randomly among valid options
- Uses color compatibility (including rainbow logic)

**UI Requirements**:

- No organ selection needed
- Automatic effect
- Toast notifications show results

**Implementation**:

- Color: `blue`
- Selection: None required
- Server logic: Random target selection with validation

### 🧤 LATEX GLOVE (Yellow)

**Effect**: All other players discard their entire hand

**Rules**:

- Affects all players except the one who played it
- Affected players start their next turn in draw phase
- Cannot play cards if hand is empty

**UI Requirements**:

- No organ selection needed
- Toast notification for affected players
- Special turn handling for empty hands

**Implementation**:

- Color: `yellow`
- Selection: None required
- Server logic: Modifies all other player hands and turn phases

### 🧪 MEDICAL ERROR (Rainbow)

**Effect**: Exchange entire body with another player

**Rules**:

- Exchanges all organs, viruses, and medicines
- Immunized organs are also exchanged
- Number of organs doesn't matter

**UI Requirements**:

- Must select 1 organ from target player (to identify them)
- Cannot select own organs
- Toast notification about body exchange

**Implementation**:

- Color: `rainbow`
- Selection: One organ (to identify target player)
- Server logic: Complete board swap

## Selection Logic Summary

| Treatment     | Organs Needed | Player Restrictions | Special Notes                 |
| ------------- | ------------- | ------------------- | ----------------------------- |
| Transplant    | 2             | Different players   | Both organs shown as selected |
| Organ Thief   | 1             | Not current player  | Clear "steal" visual          |
| Contagion     | 0             | N/A                 | Automatic targeting           |
| Latex Glove   | 0             | N/A                 | Affects all others            |
| Medical Error | 1             | Not current player  | Body swap indicator           |

## Notifications

### Toast Notifications

- **Organ Stolen**: "Player X stole your Y organ!"
- **Hand Discarded**: "Player X used Latex Glove - all your cards were discarded!"
- **Organ Transplanted**: "Player X transplanted your Y organ with Player Z's W organ"
- **Medical Error**: "Player X swapped bodies with you!"
- **Contagion**: "Player X spread a virus to your Y organ!"

### Error Messages

- **Invalid Selection**: Appropriate message for each treatment type
- **No Valid Targets**: "No valid targets for this treatment"
- **Selection Required**: "Must select [number] organ(s) to use this treatment"

## Technical Implementation

### Client-Side Validation

```typescript
// In handleOrganClick
if (selectedCard?.type === "treatment") {
  switch (selectedCard.color) {
    case "red": // transplant - needs 2 organs from different players
    case "green": // organ thief - needs 1 organ from other player
    case "rainbow": // medical error - needs 1 organ from other player
    case "blue": // contagion - no selection needed
    case "yellow": // latex glove - no selection needed
  }
}
```

### Server-Side Logic

```typescript
// In applyTreatmentEffect
switch (card.color) {
  case "red":
    return applyTransplant(allBoards, currentPlayerId, action);
  case "green":
    return applyOrganThief(allBoards, currentPlayerId, action);
  case "blue":
    return applyContagion(allBoards, currentPlayerId);
  case "yellow":
    return applyLatexGlove();
  case "rainbow":
    return applyMedicalError(allBoards, currentPlayerId, action);
}
```

## Card Deck Mapping

- Red Treatment Cards → Transplant
- Green Treatment Cards → Organ Thief
- Blue Treatment Cards → Contagion
- Yellow Treatment Cards → Latex Glove
- Rainbow Treatment Cards → Medical Error

This mapping allows the system to determine treatment type by card color while maintaining the visual card design.
