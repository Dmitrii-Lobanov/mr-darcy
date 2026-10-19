# Booking rules

## Scope

Mr. Darcy serves one organizer offering scheduled workshops.
Each session has a fixed capacity.
A booking reserves places in exactly one session.

## Quantities

A customer may request between 1 and 6 places per booking.
The requested quantity must also fit within the session's
currently available capacity.

## Temporary holds

A successful reservation creates a HOLD lasting 10 minutes.
The backend determines the expiry using database time.

A hold is active only while:

expires_at > current_database_time

At the exact expiry instant, the hold is no longer active.
An expired hold stops consuming capacity even if the expiry
worker has not updated its stored status yet.

## Capacity invariant

For every session:

confirmed places + places in active holds <= session capacity

A request that cannot be fully accommodated is rejected.
Partial allocation is not allowed.

## Booking price

A booking stores the unit price and currency agreed upon
when the hold is created.

Money is represented using integer minor units.
For example, USD 48.00 is stored as 4800 cents.

Changing a session's price does not change existing bookings.

## Example: allocating the remaining capacity

Given a session with capacity 10:

- 4 places are confirmed.
- 3 places belong to active holds.
- 2 places belong to an expired hold.

There are 3 available places.

A request for 4 places is rejected.
A request for 3 places creates a HOLD.

Creating a hold does not confirm the booking.
Confirmation requires a valid payment success processed
before the hold expires.

## Booking states and transitions

A successful reservation creates a booking in HOLD.

Allowed transitions:

- HOLD → CONFIRMED:
  The backend processes a valid payment success before expiry.

- HOLD → EXPIRED:
  The hold's deadline has passed.

- HOLD → CANCELLED:
  The customer or organizer cancels an unexpired hold.

- CONFIRMED → CANCELLED:
  An eligible customer cancellation or organizer cancellation
  is accepted.

EXPIRED and CANCELLED are terminal booking states.
They cannot return to HOLD or CONFIRMED.

Repeated cancellation or expiry must not create another
transition or release capacity again.

## Expiry takes precedence

Before confirming or cancelling a HOLD, the backend checks
its expiry using authoritative database time.

If expires_at <= decision_time, the booking is expired,
even if its stored state is still HOLD.

A payment success received after expiry must not confirm
the booking. It is recorded for simulated compensation.

## Failed payment attempts

A failed payment attempt does not immediately end an
unexpired hold.

The customer may retry checkout before the original deadline.
A failed attempt does not extend that deadline.

## Cancellation rules

Customers may cancel only their own bookings.

An unexpired HOLD may be cancelled immediately.

A customer may cancel a CONFIRMED booking only before
the session starts:

decision_time < session.starts_at

At or after the session's start, customer cancellation
is rejected.

The organizer may cancel a HOLD or CONFIRMED booking.
Organizer cancellation requires a reason.

Cancellation applies to the whole booking.
Partial cancellation is outside the initial scope.

A successful cancellation changes the booking to CANCELLED.
Its places no longer consume capacity.

If a confirmed booking is cancelled, the backend records
the required simulated refund work atomically with
the cancellation.

Repeating an accepted cancellation has no additional effect:

- No second state transition.
- No additional capacity change.
- No duplicate simulated refund work.

Cancelling an EXPIRED booking leaves it EXPIRED.
An expired hold is never revived by cancellation.

## Retried reservation requests

Every hold-creation request must include an idempotency key.

The key identifies one intended reservation operation
for an authenticated customer.

If the same customer retries with the same key and request
data, the backend returns the original operation's result.
It must not create another booking or reserve more places.

If the same customer reuses the key with different request
data, the backend rejects the request with a conflict.

Request data includes the session ID and quantity.

A deliberate new reservation attempt uses a new key.
Retrying an old request does not extend the original hold.

Concurrent requests using the same customer and key must
also produce at most one booking.

## Permissions

Anyone may browse upcoming sessions and view session details.

Customers must sign in before creating a hold.

A customer may:

- Create a hold for themselves.
- View their own bookings.
- Complete simulated checkout for their own active holds.
- Cancel their own eligible bookings.

The backend derives the customer identity from the
authenticated session. It must not trust a customer ID
provided in the request body.

The organizer may:

- Create and manage sessions.
- View all bookings and their event timelines.
- Cancel bookings according to the organizer cancellation rules.

Every protected API operation must enforce these permissions.

Knowing a booking ID does not grant access to that booking.
Hiding controls in the frontend does not enforce authorization.

## Acceptance criteria

### Capacity

Given a session with 10 places, 4 confirmed places,
and 3 places in active holds:

- A request for 3 places succeeds.
- A request for 4 places fails.
- Expired holds consume no capacity.

### Confirmation

Given a hold expiring at 14:10:00:

- Valid payment success evaluated at 14:09:59 confirms it.
- Valid payment success evaluated at 14:10:00 does not.
- Confirmation converts held places into confirmed places
  without changing the total allocated capacity.

### Cancellation

Given a confirmed booking for 2 places:

- An eligible cancellation makes 2 places available.
- Retrying cancellation releases no additional capacity
  and creates no duplicate refund work.

### Idempotency

Given a successful hold request:

- Retrying the same customer, key, and request data
  creates no additional booking.
- Reusing that key with different request data
  returns a conflict.
- Concurrent identical retries create at most one booking.

### Authorization

- Customers can access and cancel only their own bookings.
- Cancellation must also satisfy state and timing rules.
- Organizer operations require organizer permissions.

### Concurrency

Given 10 available places and 50 simultaneous requests
for one place each:

- Exactly 10 requests allocate places under controlled
  test conditions with distinct idempotency keys.
- Total allocated capacity never exceeds 10.
