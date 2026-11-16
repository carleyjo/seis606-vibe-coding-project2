## Feedback

## Feedback from Anh and Scott
| Feedback | Decision | Reason | Where it changed (e.g., contract, spec, code) |
|---|---|---|---|
| Define one complete search request and response—including field types, prices, opening hours, missing data and errors—before building separately. | Accept | This clarifies what is expected from the app. | Spec (FR 015 and 16) |
| Clarify accounts and saved preferences. Decide whether logging in is required, what gets saved, where it lives, and when it is cleared. | Reject | We do not feel saving or logging in will be necessary for users and they are not able to book any tickets to the attractions, so there is no need for users to revisit what they decide that they would like to do. | Clarified with Spec 017 and updated assumptions |
| Set a consistent missing-data rule. Can an attraction with unknown admission cost appear or be selected? Neither component should guess. | Accept | This is accepted as it prevents the agent from making up costs of attractions. | Spec (added 2 acceptance tests and an acceptance scenario and updated some functional requirements) |
| Assign each risk to a person. Add a disclaimer or data provider is not someone responsible for handling the problem. | Accept | We misunderstood what the owner section of risk meant. | Spec (owner part of Risks and Governance) |
| Agree on the swap date and integration test. Prove the frontend can submit a trip and correctly display the backend's response before expanding components. | Accept |  | Contract |

## Feeback with CoPilot Speckit clarify

| Feedback | Decision | Reason | Where it changed (e.g. contract, spec, code) |
|---|---|---|---|
| What about places with no child price? | Accept | It now uses the adult ticket price rather than guessing a child price. | Spec (changed acceptance test 2, User Story 2, and FR-005) |
| Include the price of transport in the budget? | Reject | The budget is only for attractions; users should have a separate budget for transportation. |  Spec (Clerified in trasportaion costs)
| Different attractions having different age requirements for a child ticket | Accept | This is also important to improve accuracy. | Spec (many sections updated) |

