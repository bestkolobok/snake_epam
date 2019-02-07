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
import { ELEMENT, COMMANDS } from './constants';
import {
  isGameOver, getHeadPosition, getElementByXY, getLength, checkFly, checkFury, getWayLength, getNextPosition
} from './utils';

// Bot Example
let snakeLength = null;
let isFly = false;
let isFury = false;
let defaultDirection = true;
// let count = 0;

export function getNextSnakeMove(board, logger) {
    // if(count === 10){
    //     defaultDirection = !defaultDirection;
    //     count = 0;
    // }
    // count++;
    snakeLength = getLength(board);
    isFly = checkFly(board);
    isFury = checkFury(board);
    console.log('snakeLength', snakeLength);

    if (isGameOver(board)) {
        return '';
    }

    const headPosition = getHeadPosition(board);
    // console.log('headPosition', headPosition)
    if (!headPosition) {
        return '';
    }
    logger('Head:' + JSON.stringify(headPosition));

    const surround = getSurround(board, headPosition); // (LEFT, UP, RIGHT, DOWN)
    logger('Surround: ' + JSON.stringify(surround));
    // console.log('surround', surround)

    const raitings = surround.map(rateElement);
    logger('Raitings:' + JSON.stringify(raitings));

    // let command = getCommandByRaitings(raitings);
    let command = getCommandByElement(board);
    command = getCommandByRaitings(raitings, command);

    // console.log('searchGold(board)', getCommandByElement(board, 'APPLE'))
    return command;
}

function getSurround(board, position) {
    const p = position;
    return [
        getElementByXY(board, {x: p.x - 1, y: p.y }), // LEFT
        getElementByXY(board, {x: p.x, y: p.y -1 }), // UP
        getElementByXY(board, {x: p.x + 1, y: p.y}), // RIGHT
        getElementByXY(board, {x: p.x, y: p.y + 1 }) // DOWN
    ];
}

function rateElement(element) {
    if (
        element === ELEMENT.APPLE ||
        element === ELEMENT.GOLD ||
        element === ELEMENT.FURY_PILL ||
        element === ELEMENT.FLYING_PILL
    ) {
        return 3;
    }

    if(element === ELEMENT.STONE && snakeLength > 12) return 3;
    if(element === ELEMENT.STONE && snakeLength > 9) return 2;
    if(element === ELEMENT.STONE && snakeLength > 5) return -1;

    if (element === ELEMENT.NONE) {
        return 0;
    }
    return -2;
}


function getCommandByRaitings(raitings, command) {
    console.log('command', command)
    var indexToCommand = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
    var maxIndex = 0;
    var max = -Infinity;
    for (var i = 0; i < raitings.length; i++) {
        var r = raitings[i];
        if (r === 0 && command === indexToCommand[i]){ r = 1 }
        if (r > max) {
            maxIndex = i;
            max = r;
        }
    }
    return indexToCommand[maxIndex];
    // return "UP";
}

function getCommandByElement(board) {
    const headPosition = getHeadPosition(board);
    // const position = getNextPosition(board, headPosition, 'APPLE');

    const positionApple = getNextPosition(board, headPosition, 'APPLE');
    const positionGold = getNextPosition(board, headPosition, 'GOLD');

    const lengthToGold = getWayLength(headPosition, positionGold);

    let lengthToApples = 0;
    let previousPositions = [];
    let currentPosition = headPosition;

    for(let i = 0; i < 5; i++){
        // console.log('currentPosition'+i, currentPosition)
        const nextPosition = getNextPosition(board, currentPosition, 'APPLE', previousPositions);
        lengthToApples += getWayLength(currentPosition, nextPosition);
        previousPositions.push(currentPosition);
        currentPosition = nextPosition;
    }

    const position = isNaN(lengthToGold) || lengthToApples < lengthToGold ? positionApple : positionGold;
    console.log('position', isNaN(lengthToGold) || lengthToApples < lengthToGold)




    if(defaultDirection){
        if(position.x > headPosition.x) return "RIGHT";
        if(position.x < headPosition.x) return "LEFT";
        if(position.y > headPosition.y) return "DOWN";
        return "UP"
    }else{
        if(position.y > headPosition.y) return "DOWN";
        if(position.y < headPosition.y) return "UP";
        if(position.x > headPosition.x) return "RIGHT";
        return "LEFT";
    }

}

