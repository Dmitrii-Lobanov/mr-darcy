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