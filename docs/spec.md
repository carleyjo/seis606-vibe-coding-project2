# Feature Specification: Travel Buddy

**Feature Branch**: `Feedback week 10`

**Created**: 2026-11-07 updated 2026-11-13

**Status**: Draft

**Input**: User description: "Build a web application that lets travelers enter a city, travel dates, group composition, car availability, and budget, then find affordable attractions open during the trip, with public transportation options when they do not have a car."

## Clarifications

### Session 2026-11-13

- Q: Which access model should the specification require? → A: Allow guest use without authentication for the standalone first release; any future server endpoint must follow the project constitution's authentication requirement.
- Q: Should the entered budget cover only attraction admission fees, or should it also include local transportation costs? → A: Admission fees only; transportation costs are informational and are not deducted.
- Q: What should happen when an attraction has no reliable child admission price but the travel group includes children? → A: Use the adult price as a conservative child-price estimate and clearly label the assumption.
- Q: How should the application handle attractions with different child age definitions? → A: Collect each child's age and apply the attraction's published age bands to determine that child's price category.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find attractions for a trip (Priority: P1)

As a traveler planning an upcoming trip, I want to enter my destination, dates,
traveling adults and children, transportation situation, and total budget so that I
can see attractions that fit my trip.

**Why this priority**: This is the core value of the application and provides a
complete useful result without requiring itinerary editing.

**Independent Test**: Submit a valid trip search and verify that the results are
limited to attractions in the selected city that are open on at least one selected
date and whose total group admission cost is within the stated budget.

**Acceptance Scenarios**:

1. **Given** a valid city, future travel dates, at least one adult, a nonnegative
   budget, and a transportation choice, **When** the traveler submits the search,
   **Then** the application displays matching attractions with their names, costs,
   open dates or hours, and source attribution.
2. **Given** an attraction whose total admission cost exceeds the budget, **When**
   results are generated, **Then** that attraction is excluded.
3. **Given** an attraction open on at least one selected date, **When** results are
   generated, **Then** it is eligible even if it is closed on other selected dates.
4. **Given** an attraction with free admission, **When** results are generated,
   **Then** it is included with a group admission cost of zero.
5. **Given** an attraction with an unknown admission cost, **When** results are
   generated, **Then** it is included with an explicit unknown-cost disclaimer.
6. **Given** no matching attractions, **When** the search completes, **Then** the
   application clearly states that no matches were found and suggests changing the
   search inputs.

---

### User Story 2 - See group-aware prices (Priority: P1)

As a traveler bringing adults and children, I want prices calculated for every person
in my group so that I can keep the complete attraction cost within my budget.

**Why this priority**: A per-person price that ignores children or group size could
cause travelers to exceed their budget.

**Independent Test**: Search with different adult counts and child ages and verify
that each child is assigned to the attraction's published age band and that the
displayed total uses the applicable price for every traveler.

**Acceptance Scenarios**:

1. **Given** a group with adults and children of different ages and an attraction
   with age-based prices, **When** results are displayed, **Then** the application
   assigns each child to the attraction's published age band and shows the traveler
   counts, applicable prices, and total group admission cost.
2. **Given** an attraction with no child price, **When** results are displayed, **Then**
   the application uses the adult price as a conservative estimate for each child and
   clearly labels the estimate and source pricing limitation.
3. **Given** a group total exactly equal to the budget, **When** results are generated,
   **Then** the attraction remains eligible.

---

### User Story 3 - Build an affordable attraction list (Priority: P2)

As a traveler, I want to select multiple attractions while seeing the remaining
budget so that I can assemble a realistic set of activities.

**Why this priority**: Travelers need more than a single recommendation to plan a
trip while staying within the total budget.

**Independent Test**: Select and remove attractions from a result set and verify that
the running total and remaining budget update correctly, known-cost selections never
exceed the budget, and unknown-cost selections are clearly labeled.

**Acceptance Scenarios**:

1. **Given** matching results and remaining budget, **When** the traveler selects an
   attraction, **Then** it is added to the trip list and the remaining budget is
   reduced by its group cost.
2. **Given** a selected attraction list, **When** adding another attraction would
   exceed the budget, **Then** the application prevents the selection and explains
   why.
3. **Given** a selected attraction, **When** the traveler removes it, **Then** the
   running total and remaining budget are restored.
4. **Given** the same attraction is selected twice, **When** the second selection is
   attempted, **Then** the application prevents duplicate selection.
5. **Given** an unknown-cost attraction, **When** the traveler selects it, **Then**
   it is added to the trip list, its cost is labeled unknown, and the trip's budget
   impact is labeled unknown rather than calculated or guessed.

---

### User Story 4 - Plan without a car (Priority: P2)

As a traveler without a car, I want public transportation information for each
suggested attraction so that I can judge whether the activity is practical.

**Why this priority**: Transportation access materially affects whether a traveler
can use an attraction recommendation.

**Independent Test**: Run a search with car availability set to no and verify that each
result includes available public transportation guidance or an explicit unavailable
label.

**Acceptance Scenarios**:

1. **Given** the traveler does not have a car and a result has public transportation
   information, **When** results are displayed, **Then** the result includes that
   information with its source attribution.
2. **Given** the traveler has a car, **When** results are displayed, **Then** the
   application does not require public transportation information for eligibility.
3. **Given** no public transportation information is available for a result, **When**
   the traveler has no car, **Then** the application clearly labels the information
   as unavailable and does not invent a route, schedule, or fare.



### Edge Cases

- The city is blank, not recognized, or resolves to multiple cities. 
- The start date is after the end date, dates are in the past, or dates are invalid.
- The group contains zero adults, a negative count, or an unreasonable count.
- A child age is missing, negative, outside the accepted range, or falls on an
  attraction's age-band boundary.
- The budget is negative, missing, or entered with more precision than supported.
- An attraction has free admission, variable pricing, or incomplete pricing.
- An attraction has no opening information or is closed for all selected dates.
- Source data is unavailable, stale, contradictory, or missing transportation details.
- The search returns a large result set; the traveler must still be able to scan and
  compare results.
- The browser loses connectivity while loading or refreshing source information.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST present results in a scannable layout that works on
  current desktop and mobile browsers.
- **FR-002**: The application MUST allow users to enter a destination city, travel
  start date, travel end date, adult count, the age of each child, car availability,
  and total trip budget.
- **FR-003**: The application MUST validate required fields, date order, date validity,
  nonnegative counts, at least one adult, and a whole-number child age from 0 through
  17 for every child, and a nonnegative budget before searching.
- **FR-004**: The application MUST identify attractions associated with the selected
  city and exclude attractions that are not open on at least one selected date.
- **FR-005**: The application MUST calculate each attraction's total group admission
  cost using the applicable adult price and the price category determined for each
  child's age by that attraction's published age bands. When a child price is
  unavailable, it MUST use the adult price as a conservative estimate for that child
  and clearly label the estimate.
- **FR-006**: The application MUST exclude attractions whose known calculated group
  admission cost is greater than the entered budget. Attractions identified as free
  MUST be included with a group admission cost of zero.
- **FR-006a**: The application MUST include attractions whose admission cost is
  unknown, clearly label the cost as unknown, and display a disclaimer that the
  attraction's budget impact cannot be determined from available data.
- **FR-007**: The application MUST display each result's name, description, group
  price breakdown, total cost, relevant opening information, and source attribution.
- **FR-008**: The application MUST allow users to select multiple suggested attractions
  and MUST display the selected total and remaining budget.
- **FR-009**: The application MUST prevent a selected attraction list with only known
  costs from exceeding the entered budget and MUST prevent duplicate selections.
  It MUST allow an unknown-cost attraction to be selected, but MUST label the
  resulting selected total and remaining budget as unknown when that selection
  prevents a definitive calculation.
- **FR-010**: When the user indicates they do not have a car, the application MUST
  display public transportation options for every result when source data provides
  them.
- **FR-011**: The application MUST explicitly label unavailable, incomplete, or
  uncertain attraction, pricing, opening, and transportation data.
- **FR-012**: The application MUST NOT invent attraction details, prices, opening
  information, routes, schedules, or fares.
- **FR-013**: The application MUST use Wikivoyage as the primary free source for
  attraction and destination information, or clearly identify an approved supporting
  source when required information is unavailable there.
- **FR-014**: The application MUST provide user-facing error messages when the source
  cannot be reached or the search cannot be completed.
- **FR-015**: A user MUST be able to enter the city they are traveling to, the date
  they are arriving, the date they are leaving, the number of adults in the travel
  party (at least one), the age of each child in the party, their budget, and whether
  they have a car.
  When the user enters this information, the application MUST respond with a list of
  attractions within the travel party budget when the cost is known, include free
  attractions at zero cost, and include unknown-cost attractions with an unknown-cost
  disclaimer. Results MUST give the attraction name, whole-party cost when known, and
  transportation options if the user does not have a car.
- **FR-016**: When the application displays search results, users MUST be able to
  select each attraction, including unknown-cost attractions. The application MUST
  show all selected attractions, prevent known costs from exceeding the budget, and
  clearly label the total and remaining budget as unknown when an unknown-cost
  selection prevents a definitive calculation.
- **FR-017**: The standalone first release MUST allow users to search and manage selections without creating an account or signing in. Any future server endpoint MUST require authentication.

### Key Entities

- **Trip Search**: A user's destination, travel dates, group composition,
  transportation choice, and total budget.
- **Traveler Group**: The number of adults and children whose admission costs are
  included in calculations, including the age of each child.
- **Attraction**: A tourist destination with descriptive information, location,
  admission pricing, opening information, transportation guidance, and source
  attribution.
- **Attraction Selection**: A user's chosen attraction and its calculated group cost
  within the current trip budget, or an unknown cost that has been explicitly
  disclosed to the user.
- **Source Record**: The origin, retrieval status, and freshness context for
  attraction details shown to the user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of valid searches display either matching results or a
  clear no-results explanation within 10 seconds under normal network conditions.
- **SC-002**: In test searches with known prices and age bands, 100% of displayed
  group totals equal the sum of each adult's applicable price and each child's price
  for the age band that contains that child's age.
- **SC-003**: In test searches, 100% of displayed attractions are open on at least one
  selected date and either have a known group cost no greater than the entered budget,
  are free with a group cost of zero, or are clearly labeled as unknown cost.
- **SC-004**: Users can identify the attraction name, total group cost, open dates, and
  transportation information from a result without opening a separate detail view.
- **SC-005**: In usability testing, at least 90% of participants can complete a valid
  search and select a set of attractions within the budget on their first attempt.
- **SC-006**: In test searches without a car, 100% of results show public transportation
  guidance or an explicit unavailable-data label.
- **SC-007**: The primary search and selection flows are usable on both desktop and
  mobile browsers without loss of required information or controls.

## Assumptions

- Users have internet access; the standalone first release does not require an account.
- The total budget applies to attraction admission for the full traveler group, not
  flights, lodging, meals, or local transportation costs
- A selected date range includes every calendar date from the start date through the
  end date.
- An attraction with free admission has a group admission cost of zero.
- Unknown-cost attractions may be selected, but their cost and budget impact remain
  unknown until reliable pricing is available; the application never treats them as
  free or as a guessed amount.
- When a child price is missing, the adult price is used as a conservative estimate
  for each child and the result is labeled as an estimate.
- Attraction-specific child age bands determine each child's price category; age-band
  boundaries are interpreted according to the attraction's published rules.
- Wikivoyage is the primary source, but source content may be incomplete or change
  after it is retrieved; displayed source status communicates that limitation.
- Weather alerts, notifications, hotels, flights, and automatic itinerary scheduling
  are out of scope for this feature.


## Risks and Governance

| Risk | Likelihood (high/medium/low) | Impact (high/medium/low) | Mitigation | Owner | Status |
|---|---|---|---|---|---|
| Data category (Wikivoyage data) | Low | Low | If the data is inaccurate or outdated, find a new source. Add a disclaimer that attraction costs and operating hours may change before the user's visit. | Niamh | Wikivoyage is currently accessible |
| Data category (user-entered data) | Low (only dates, budget, etc.; no personal information) | Low | Test that dates, budgets, and other inputs are handled correctly and are not stored after the user leaves.|Niamh and Carley | Not active yet |
| Decisions (the app recommends activities) | Medium | Medium | Add a disclaimer that the app provides suggestions and the final decision to visit is up to the user. | Carley | Not active yet |
| Failure (the app is unavailable) | Medium | High | Display a message such as “The app is down. Come back later!” and notify the project team through student email (onei7114@stthomas.edu and saeg2148@stthomas.edu). |Niamh and Carley | Not active yet |
| Agents (spending access) | Low | Low | Agents must not spend money for this app or have access to any bank account or credit card. |Niamh and Carley | Active |
