# seis606-vibe-coding-project2

# TravelBuddy

A budget-aware travel attraction planner that helps travelers discover affordable attractions based on their destination, travel dates, group size, and transportation options.

## Overview

TravelBuddy is a web application that simplifies trip planning by helping users find attractions that:

- Fit within their budget
- Are open during their travel dates
- Match their group size
- Include transportation information when traveling without a car

Rather than searching multiple websites for pricing, hours, and transportation details, travelers can enter their trip information and receive filtered attraction recommendations in one place.

## Features

### Attraction Search

Search for attractions using:

- Destination city
- Travel dates
- Number of adults
- Number of children
- Total budget
- Car availability

### Budget-Aware Recommendations

The application automatically filters attractions to include only those whose total admission cost falls within the user's budget.

### Group-Based Cost Calculations

TravelBuddy calculates costs based on the entire travel group:

```text
Total Cost =
(Adult Price × Number of Adults)
+
(Child Price × Number of Children)
```

### Attraction Selection

Users can create a trip plan by:

- Selecting attractions
- Tracking total spending
- Viewing remaining budget
- Removing attractions from their plan

The application prevents:

- Duplicate selections
- Budget overruns

### Public Transportation Support

When travelers do not have a car, attraction results include available:

- Bus information
- Train information
- Public transportation guidance
- Source attribution

If transportation information is unavailable, the application clearly identifies the missing data.

---

## User Inputs

TravelBuddy collects the following information:

| Input | Description |
|---------|-------------|
| City | Destination city being visited |
| Start Date | Beginning of trip |
| End Date | End of trip |
| Adults | Number of adult travelers |
| Children | Number of child travelers |
| Car Availability | Indicates whether the traveler has access to a vehicle |
| Budget | Total attraction budget for the group |

---

## Business Rules

- Users must provide valid trip information before searching.
- At least one adult traveler is required.
- Budgets must be non-negative.
- Attractions must be open on at least one selected travel date.
- Attractions must fit within the specified budget.
- Missing pricing or transportation information must be labeled instead of assumed.
- Attraction details are never generated or invented.

---

## Data Sources

### Primary Source

- Wikivoyage API

TravelBuddy uses Wikivoyage as its primary source of destination and attraction information.

Reference:
https://enterprise.wikimedia.com/project-data/wikivoyage-api/

---

## Functional Requirements

### Search Requirements

The system must allow users to enter:

- Destination city
- Travel dates
- Adult count
- Child count
- Budget
- Transportation preference

### Result Requirements

The system must:

- Display attraction names
- Show descriptions
- Calculate group costs
- Display attraction availability
- Show source attribution
- Include transportation information when available

### Planning Requirements

The system must:

- Allow multiple attraction selections
- Track total spending
- Display remaining budget
- Prevent duplicate selections
- Prevent plans from exceeding the budget

---

## Project Structure

```text
travelbuddy/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── database/
│
├── docs/
│   ├── specification.md
│   ├── contract.md
│   └── working-agreement.md
│
└── README.md
```

---

## Team

### Carley Saeger
**Frontend Developer**

Responsible for:

- User interface design
- Form validation
- Navigation
- Displaying API responses and errors

### Niamh O'Neill
**Backend Developer**

Responsible for:

- API development
- Database schema
- Authentication
- Business logic

---

## Development Approach

This project follows a **Contract-First Build with Midpoint Swap** workflow.

### Phase 1
- Frontend and backend are developed independently.
- Both components follow a shared contract and specification.

### Phase 2
- Components are integrated.
- Team members swap components and add features or improvements.

### Phase 3
- Final testing, review, and approval.

All AI-generated code is reviewed by a human before acceptance into the project.

---

## Milestones

### Milestone 1 – November 17

Deliverables:

- Frontend mockup
- Backend attraction data integration

### Future Milestones

- Attraction selection and budget tracking
- Public transportation integration
- Mobile optimization
- Full frontend-backend integration

---

## Success Criteria

The project is successful when:

- 95% of searches return results or a clear no-results message within 10 seconds.
- Attraction costs are calculated correctly.
- Budget filtering works for all searches.
- Public transportation information is displayed when available.
- Users can build attraction plans without exceeding their budget.
- The application works on desktop and mobile devices.

---

## Future Enhancements

Potential future features include:

- Interactive maps
- Saved trips
- Personalized recommendations
- Route optimization
- Multi-day itinerary planning
- Real-time transit data
- Hotel and flight recommendations

---

## Branch Information

```text
Feature Branch: 001-travel-attraction-planner
Status: Draft
Created: 2026-11-07
```

---

## Authors

- Carley Saeger
- Niamh O'Neill

SEIS-606: Vibe Coding