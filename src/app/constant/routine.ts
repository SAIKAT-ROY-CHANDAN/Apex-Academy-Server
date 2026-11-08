/**
 * Class routine room rules.
 *
 * A room number belongs to a single routine cell (day + period), and by
 * default a room may not host two different classes at the same time.
 *
 * `ENFORCE_ROOM_CONFLICT` is the single switch for that rule:
 *
 *   true  - saving a room that is already taken in the same day + period by
 *           another routine fails with a 409 (the default, and the safe one).
 *   false - the check is skipped entirely, which is what institutes that run
 *           combined classes in one room need. Rooms are still stored and
 *           displayed, they just stop being exclusive.
 *
 * Only `checkRoomConflicts` in
 * `src/app/modules/classRoutine/classRoutine.service.ts` reads this flag, so
 * flipping it here changes the behaviour of both create and update.
 */
export const ENFORCE_ROOM_CONFLICT = true;