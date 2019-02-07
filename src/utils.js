/*-
 * #%L
 * Codenjoy - it's a dojo-like platform from developers to developers.
 * %%
 * Copyright (C) 2018 - 2019 Codenjoy
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */
import {
  ELEMENT
} from './constants';

// Here is utils that might help for bot development
export function getBoardAsString(board) {
    const size = getBoardSize(board);

    return getBoardAsArray(board).join("\n");
}

export function getBoardAsArray(board) {
  const size = getBoardSize(board);
  var result = [];
  for (var i = 0; i < size; i++) {
      result.push(board.substring(i * size, (i + 1) * size));
  }
  return result;
}

export function getBoardFullArray(board){
    return getBoardAsArray(board).reduce((acc, row, y) => {
        const rowArr = row.split('').map((item, x) => ({x: x, y: y, el: item}));
        acc = [...acc, ...rowArr];
        return acc
    }, [])
}

export function getBoardSize(board) {
    return Math.sqrt(board.length);
}

export function isGameOver(board) {
    return board.indexOf(ELEMENT.HEAD_DEAD) !== -1;
}

export function isAt(board, x, y, element) {
    if (isOutOf(board, x, y)) {
        return false;
    }
    return getAt(board, x, y) === element;
}

export function getAt(board, x, y) {
    if (isOutOf(board, x, y)) {
        return ELEMENT.WALL;
    }
    return getElementByXY(board, { x, y });
}

export function isNear(board, x, y, element) {
    if (isOutOf(board, x, y)) {
        return ELEMENT.WALL;
    }

    return isAt(board, x + 1, y, element) ||
			  isAt(board, x - 1, y, element) ||
			  isAt(board, x, y + 1, element) ||
			  isAt(board, x, y - 1, element);
}

export function isOutOf(board, x, y) {
    const boardSize = getBoardSize(board);
    return x >= boardSize || y >= boardSize || x < 0 || y < 0;
}

export function getHeadPosition(board) {
    return getFirstPositionOf(board, [
        ELEMENT.HEAD_DOWN,
        ELEMENT.HEAD_LEFT,
        ELEMENT.HEAD_RIGHT,
        ELEMENT.HEAD_UP,
        ELEMENT.HEAD_DEAD,
        ELEMENT.HEAD_EVIL,
        ELEMENT.HEAD_FLY,
        ELEMENT.HEAD_SLEEP,
    ]);
}

export function getFirstPositionOf(board, elements) {
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var position = board.indexOf(element);
        if (position !== -1) {
            return getXYByPosition(board, position);
        }
    }
    return null;
}

export function getXYByPosition(board, position) {
    if (position === -1) {
        return null;
    }

    const size = getBoardSize(board);
    return {
        x:  position % size,
        y: (position - (position % size)) / size
    };
}

export function getElementByXY(board, position) {
    const size = getBoardSize(board);
    return board[size * position.y + position.x];
}

export function getLength(board){
    return board.split('').filter(item => {
        return (
            item === ELEMENT.BODY_HORIZONTAL ||
            item === ELEMENT.BODY_VERTICAL ||
            item === ELEMENT.BODY_LEFT_DOWN ||
            item === ELEMENT.BODY_LEFT_UP ||
            item === ELEMENT.BODY_RIGHT_DOWN ||
            item === ELEMENT.BODY_RIGHT_UP ||

            item === ELEMENT.TAIL_END_DOWN ||
            item === ELEMENT.TAIL_END_LEFT ||
            item === ELEMENT.TAIL_END_UP ||
            item === ELEMENT.TAIL_END_RIGHT ||
            item === ELEMENT.TAIL_INACTIVE ||

            item === ELEMENT.HEAD_DOWN ||
            item === ELEMENT.HEAD_LEFT ||
            item === ELEMENT.HEAD_RIGHT ||
            item === ELEMENT.HEAD_UP ||
            item === ELEMENT.HEAD_DEAD ||
            item === ELEMENT.HEAD_EVIL ||
            item === ELEMENT.HEAD_FLY ||
            item === ELEMENT.HEAD_SLEEP
        )
    }).length
}

export function checkFly(board){
    return board.indexOf(ELEMENT.HEAD_FLY) !== -1
}

export function checkFury(board){
    return board.indexOf(ELEMENT.HEAD_EVIL) !== -1
}

export function getWayLength (from, to){return Math.abs(from.x-to.x) + Math.abs(from.y-to.y)}

export function getNextPosition(board, position, element = 'GOLD', skipElements = []){
    const elementsArr = getBoardFullArray(board).filter(item => item.el === ELEMENT[element]);
    return elementsArr.reduce((acc,item) => {
        if (acc.x && acc.y) {
            const isSkip = skipElements.findIndex(el=> el.x === item.x && el.y === item.y) !== -1;
            if(
                getWayLength(item, position) < getWayLength(acc, position) &&
                !((position.x === item.x && position.y === item.y) || isSkip)
            ) return {x: item.x, y: item.y};
            return acc
        }
        return {x: item.x, y: item.y}
    }, {});
}
