import type { GameId } from '../storage/types'

export const TUTORIALS: Record<GameId, string[]> = {
  breakdown:
    'The memo is the board. The scrollbar thumb is your paddle. Move it with the mouse or the left and right arrows. The black dot is the ball. Clear every word. Bold words take two hits, headings take three. Page 1 of 3 in the status bar is your lives. Space hides the game. Esc leaves the file.'.split(
      '. ',
    ),
  costcutter:
    'Click a colored block in the chart, or move with the arrows and press Enter. A group of two or more touching blocks of the same color comes out. New weeks push in from the left. If a week is pushed off the right edge, the sheet is done.'.split(
      '. ',
    ),
  crash:
    'Each cell is a meeting. Drag two neighbors, or click one and then the next, or move with the arrows and press Enter. They swap only if you make a line of three. Time to deadline is the round. Space hides the game.'.split(
      '. ',
    ),
  leadership:
    'The triangle is you, between the high case and the low case. Up arrow thrusts up. Left and right thrust sideways. Fuel is Budget remaining. Touch either line and you crash. Land gently on the flat Close mark at the right.'.split(
      '. ',
    ),
  risk:
    'Click a gray cell, or move with the arrows and press Enter. Numbers count the blocked cells around you. Right-click or press F to mark Hold. Open a Block and the register closes. The first click is always safe.'.split(
      '. ',
    ),
  inbox:
    'Each message has a color. That color is its folder: 1 Now, 2 Waiting, 3 Later, 4 FYI. Select a message and press the number, or click the folder. New mail keeps arriving. If eight messages are waiting, the inbox overflows.'.split(
      '. ',
    ),
  floor:
    'This is the seating plan. You are the blue dot. Arrow keys or WASD move through the aisles. Click an aisle to walk that way. Pass over the small desk marks to clear them. The larger marks send visitors to a meeting. Touch a visitor and you lose a stop. Clear every desk mark to finish the walk.'.split(
      '. ',
    ),
  stack:
    'This is the staffing grid. Colored blocks drop in from the top. Left and right move a block. Up or W turns it. Down soft-drops it. Enter drops it to the bottom. Clear a full row of ten. Space hides the game. Esc leaves the file.'.split(
      '. ',
    ),
}
