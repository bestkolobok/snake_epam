import { ELEMENT } from './constants';

export function getBaseWay(boardArr, from, to){
    const length = {x: to.x - from.x, y: to.y - from.y};
    const lengthAbs = {x: Math.abs(length.x), y: Math.abs(length.y)};
    const sign = {
        x: length.x < 0 ? -1 : 1,
        y: length.y < 0 ? -1 : 1,
    };
    function wayByAxe (axe){
        const axes = axe === 'x' ? ['x', 'y'] : ['y', 'x'];
        const way = [];
        let endPoint = {};
        for(let i = 0; i < lengthAbs[axes[0]]; i++){
            const point = {[axes[0]]: from[axes[0]] + (i + 1)*sign[axes[0]], [axes[1]]: from[axes[1]]};
            const gamePoint = boardArr.find(item => item.x === point.x && item.y === point.y);
            way.push(gamePoint);
            if(i === lengthAbs[axes[0]] - 1){
                endPoint = point;
            }
        }
        for(let i = 0; i < lengthAbs[axes[1]]; i++){
            const point = {[axes[0]]: endPoint[axes[0]], [axes[1]]: endPoint[axes[1]] + (i + 1)*sign[axes[1]]};
            const gamePoint = boardArr.find(item => item.x === point.x && item.y === point.y);
            way.push(gamePoint);
        }
        return way
    }
    // return {x: wayByAxe('x'), y: wayByAxe('y')}

    return {x: checkWay(wayByAxe('x')), y: checkWay(wayByAxe('y'))}
}


function checkWay(way, snakeLength = 3){
    const blockElements = [ELEMENT.WALL, ELEMENT.START_FLOOR];
    if(snakeLength < 6){blockElements.push(ELEMENT.STONE)};
    const cleanWay = [];
    for(let el of way){
        if(blockElements.indexOf(el.el) !== -1) break;
        cleanWay.push(el)
    }
    return cleanWay
}

export function buildWay (boardArr, from, to){
    const baseWay = getBaseWay(from, to);



}