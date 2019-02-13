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
  isGameOver, getHeadPosition, getElementByXY, getLength, checkFly, checkFury, getWayLength, movieDirection, getBoardFullArray
} from './utils';
import { findWays } from './wayUtils';
import { getNextPosition } from './selectWaysUtils';

// Bot Example
let boardFullArray = [];
let snakeLength = null;
let isFly = false;
let isFury = 0;
let defaultDirection = true;
let count = 0;
let lastPosition = {};

export function getNextSnakeMove(board, logger) {
    ////// start INIT /////
    init(board);
    if(count === 10){
        defaultDirection = !defaultDirection;
        count = 0;
    }
    count++;
    snakeLength = getLength(board);
    isFly = checkFly(board);
    isFury = checkFury(board, isFury);
    ////// end INIT /////

    // const WAY = findWays (boardFullArray, {x: 14, y: 7}, {x: 3, y: 8}, 7);
    //
    // console.log('WAY', WAY)
    // console.log('WAY x2', WAYx2)
    // console.log('WAY y', WAYy)

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
    let elCommands = getCommandByElement(board);
    // console.log('command2', command)
    let command = getCommandByRaitings(raitings, elCommands);
    // console.log('command3', command)
    console.log('c')

    // console.log('searchGold(board)', getCommandByElement(board, 'APPLE'))
    lastPosition = headPosition;
    return command;
}

function init (board){
    boardFullArray = getBoardFullArray(board);
    function findElement(position){
        const findEl = boardFullArray.find(item => item.x === position.x && item.y === position.y)
        return findEl
    }
    boardFullArray = boardFullArray.map(item => {
        if(
            (item.y > 6 && item.y < 23 && item.x > 7 && item.x < 23) && (
                (findElement({x: item.x, y: item.y+1}).el === ELEMENT.WALL && findElement({x: item.x, y: item.y-1}).el === ELEMENT.WALL) ||
                (findElement({x: item.x+1, y: item.y}).el === ELEMENT.WALL && findElement({x: item.x-1, y: item.y}).el === ELEMENT.WALL)
            )
        ){
            return {x: item.x, y: item.y, el: ELEMENT.WALL}
        }else{
            return item
        }
    });
}

function getSurround(board, position) {
    const p = position;
    return [
        getElementByXY(boardFullArray, {x: p.x - 1, y: p.y }), // LEFT
        getElementByXY(boardFullArray, {x: p.x, y: p.y -1 }), // UP
        getElementByXY(boardFullArray, {x: p.x + 1, y: p.y}), // RIGHT
        getElementByXY(boardFullArray, {x: p.x, y: p.y + 1 }) // DOWN
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
    if(element === ELEMENT.STONE && snakeLength > 10) return 4;
    if(element === ELEMENT.STONE && snakeLength > 7) return 2;
    if(element === ELEMENT.STONE && snakeLength > 6) return 1;
    if(element === ELEMENT.STONE && snakeLength > 4) return -1;
    if(element === ELEMENT.STONE && isFury > 0) return 4;

    if(ELEMENT.ENEMY_STRING.indexOf(element) !== -1 && isFury > 1) return 5;
    if(ELEMENT.ENEMY_STRING.indexOf(element) !== -1 && isFly) return 0;
    if (element === ELEMENT.NONE) return 0;
    if(element === ELEMENT.WALL) return -3;
    return -2;
}

function getCommandByRaitings(raitings, commands) {
    var indexToCommand = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
    var maxIndex = 0;
    var max = -Infinity;
    for (var i = 0; i < raitings.length; i++) {
        var r = raitings[i];
        if (r >= 0 && commands[0] === indexToCommand[i]){ r = 2 }
        if (r >= 0 && commands[1] === indexToCommand[i]){ r = 1 }
        if (r > max) {
            maxIndex = i;
            max = r;
        }
    }
    return indexToCommand[maxIndex];
}

function getCommandByElement(board) {
    const headPosition = getHeadPosition(board);
    // const position = getNextPosition(boardFullArray, headPosition, 'APPLE');

    const positionApple = getNextPosition(boardFullArray, headPosition, 'APPLE', snakeLength);
    const positionGold = getNextPosition(boardFullArray, headPosition, 'GOLD', snakeLength);
    const positionStone = getNextPosition(boardFullArray, headPosition, 'STONE', snakeLength);
    const positionFury = getNextPosition(boardFullArray, headPosition, 'FURY_PILL', snakeLength);
    const positionEnemy = getNextPosition(boardFullArray, headPosition, ['ENEMY_BODY_HORIZONTAL', 'ENEMY_BODY_VERTICAL', 'ENEMY_BODY_LEFT_DOWN', 'ENEMY_BODY_LEFT_UP', 'ENEMY_BODY_RIGHT_DOWN', 'ENEMY_BODY_RIGHT_UP'], snakeLength);

    const ToApple = findWays(boardFullArray, headPosition, positionApple, snakeLength);
    const ToGold = findWays(boardFullArray, headPosition, positionGold, snakeLength);
    const ToStone = findWays(boardFullArray, headPosition, positionGold, positionStone);
    const ToFury = findWays(boardFullArray, headPosition, positionGold, positionFury);
    const ToEnemy = findWays(boardFullArray, headPosition, positionGold, positionEnemy);
    const FromFuryToStone = findWays(boardFullArray, positionFury, positionStone, positionStone);

    const lengthToApple = ToApple ? ToApple.length : 1000;
    const lengthToGold = ToGold ? ToGold.length : 1000;
    const lengthToStone = ToStone ? ToStone.length : 1000;
    const lengthToFury = ToFury ? ToFury.length : 1000;
    const lengthToEnemy = ToEnemy ? ToEnemy.length : 1000;
    const lengthFromFuryToStone = FromFuryToStone ? FromFuryToStone.length : 1000;

    console.log('lengthToGold', lengthFromFuryToStone);


    let lengthToApples = 0;
    let previousPositions = [];
    let currentPosition = headPosition;

    for(let i = 0; i < 4; i++){
        const nextPosition = getNextPosition(boardFullArray, currentPosition, 'APPLE', snakeLength, previousPositions);
        const addWayToApples = findWays(boardFullArray, currentPosition, nextPosition, positionEnemy);
        lengthToApples += addWayToApples.length;
        previousPositions.push(currentPosition);
        currentPosition = nextPosition;
    }

    let position = isNaN(lengthToGold) || lengthToApples < lengthToGold || (lengthToApple < lengthToGold && lengthToApple < 5)? positionApple : positionGold;

    if(lengthToStone < lengthToApple && (isNaN(lengthToGold) || lengthToStone < lengthToGold) && lengthToStone < 10 && snakeLength > 8){
        position = positionStone;
    }
    if(lengthToStone < lengthToApple*2 && (isNaN(lengthToGold) || lengthToStone < lengthToGold*2) && lengthToStone < 30 && snakeLength > 10){
        position = positionStone;
    }
    if(isFury >= lengthToStone){
        position = positionStone;
    }
    if(isFury >= lengthToEnemy){
        position = positionEnemy;
    }
    if(!isNaN(lengthToFury) && lengthToFury < 20 && lengthFromFuryToStone < 10){
        position = positionFury
    }
    console.log('lastPosition', lastPosition);
    const direction = movieDirection(headPosition, lastPosition);
    defaultDirection = direction === "DOWN" || direction === "UP";

    function setCommand (direction){
        if(!direction){
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

    const command = setCommand (defaultDirection);
    const commandTwo = setCommand (!defaultDirection);
    // console.log('commandcommandTwo', command, )
    return [command, commandTwo]
}

