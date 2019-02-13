import { ELEMENT } from './constants';

export function getBaseWay(boardArr, from, to, axe = 'x'){
    const length = {x: to.x - from.x, y: to.y - from.y};
    const lengthAbs = {x: Math.abs(length.x), y: Math.abs(length.y)};

    const sign = {
        x: length.x < 0 ? -1 : 1,
        y: length.y < 0 ? -1 : 1,
    };
    function wayByAxe (){
        const axes = axe === 'x' ? ['x', 'y'] : ['y', 'x'];
        const way = [from];
        let endPoint = {};
        for(let i = 0; i < lengthAbs[axes[0]]; i++){
            const point = {[axes[0]]: from[axes[0]] + (i + 1)*sign[axes[0]], [axes[1]]: from[axes[1]]};
            const gamePoint = boardArr.find(item => item.x === point.x && item.y === point.y);
            way.push(gamePoint);
            if(i === lengthAbs[axes[0]] - 1){
                endPoint = point;
            }
        }
        if(!endPoint.x){endPoint = from}
        for(let i = 0; i < lengthAbs[axes[1]]; i++){
            const point = {[axes[0]]: endPoint[axes[0]], [axes[1]]: endPoint[axes[1]] + (i + 1)*sign[axes[1]]};
            const gamePoint = boardArr.find(item => item.x === point.x && item.y === point.y);
            way.push(gamePoint);
        }
        return way
    }
    // return {x: wayByAxe('x'), y: wayByAxe('y')}

    return checkWay(wayByAxe())
}

function checkWay(way, snakeLength = 7){
    const blockElements = [ELEMENT.WALL, ELEMENT.START_FLOOR];
    if(snakeLength < 6){blockElements.push(ELEMENT.STONE)}
    const cleanWay = [];
    let isBreak = false;
    let wayAxe;
    let waySign;
    for(let i in way){
        const next = way[+i+1];
        if(blockElements.indexOf(way[+i].el) !== -1) {
            isBreak = true;
            if(next){
                if (way[i].x !== next.x){
                    wayAxe = 'x';
                    waySign = way[+i].x <= next.x ? 1 : -1;
                }else{
                    wayAxe = 'y';
                    waySign = way[+i].y <= next.y ? 1 : -1;
                }
            }
            break
        }
        cleanWay.push(way[+i])
    }
    return {way: cleanWay, isBreak: isBreak, wayAxe: wayAxe, waySign: waySign}
}

function buildBypassWay(boardArr, {way, wayAxe, waySign}, to, direction, snakeLength = 7){
    const blockElements = [ELEMENT.WALL, ELEMENT.START_FLOOR];
    if(snakeLength < 6){blockElements.push(ELEMENT.STONE)}
    let newWay = [...way];
    function buildStep(){
        const step = stepper(newWay, direction, wayAxe, waySign);

        if(step){
            const stepOnBoard = boardArr.find(el=> el.x === step.x && el.y === step.y);
            const isStepClean = blockElements.indexOf(stepOnBoard.el) === -1;
            return isStepClean ? {...stepOnBoard, direction: step.direction} : false
        }
        return false
    }
    function checkLastStep(step, to){
        const directionAxe = step.direction === 'x' ? 'y' : 'x';
        const lengthToAxe = to[directionAxe] - step[directionAxe];
        const sign = lengthToAxe >= 0 ? 1 : -1;
        const lengthToAxeAbs = Math.abs(lengthToAxe);
        const way = [];
        for(let i = 0; i < lengthToAxeAbs; i++){
            const point = directionAxe === 'x' ?
                boardArr.find(el=> el.x === step.x + (i+1)*sign && el.y === step.y) :
                boardArr.find(el=> el.x === step.x && el.y === step.y + (i+1)*sign)
            ;
            way.push(point)
        }
        const isBrokenWay = checkWay(way, snakeLength).isBreak;
        return !isBrokenWay
    }
    for(let i = 0; i < 100; i++){
        const newStep = buildStep();
        if(newStep){
            newWay.push(newStep)
        } else {
            newWay = null;
            break
        }
        const lastStep = newWay[newWay.length - 1];
        if (checkLastStep(lastStep, to)) break
    }
    return newWay
}

function stepper(way, stepDirection, wayAxe, waySign){
    if(way.length > 0){
        const directions = ['forward', 'left', 'right'];
        const last = way[way.length - 1];
        if(last.x < 1 || last.x > 28 || last.y < 1 || last.y > 28) return null
        let nextStep;
        if (wayAxe === 'x'){
            if(stepDirection === directions[0]) {nextStep = {x: last.x + waySign, y: last.y, direction: 'x'}}
            if(stepDirection === directions[1]) {nextStep = {x: last.x, y: last.y - waySign, direction: 'y'}}
            if(stepDirection === directions[2]) {nextStep = {x: last.x, y: last.y + waySign, direction: 'y'}}
        }else{
            if(stepDirection === directions[0]) {nextStep = {x: last.x, y: last.y + waySign, direction: 'y'}}
            if(stepDirection === directions[1]) {nextStep = {x: last.x + waySign, y: last.y, direction: 'x'}}
            if(stepDirection === directions[2]) {nextStep = {x: last.x - waySign, y: last.y, direction: 'x'}}
        }
        if (way.findIndex(el=> el.x === nextStep.x && el.y === nextStep.y) === -1)  return nextStep;
        return null
    }
    return null
}

export function buildWayByAxe (oldBoardArr, from, to, axe, snakeLength, addWay = []){
    const newAddWay = [...addWay];
    newAddWay.pop();
    const newBaseWay = getBaseWay(oldBoardArr, from, to, axe);
    const baseWay = {...newBaseWay, way: [...newAddWay, ...newBaseWay.way]};
    if (!newBaseWay.isBreak) return baseWay.way;

    function bypassBuilder(Way, boardArr){
        const leftBypass = buildBypassWay(boardArr, Way, to, 'left', snakeLength);
        const rightBypass = buildBypassWay(boardArr, Way, to, 'right', snakeLength);
        let leftCalcWay;
        let rightCalcWay;
        if(leftBypass){
            const fromLeft = leftBypass[leftBypass.length - 1];
            const leftX = buildWayByAxe(boardArr, fromLeft, to, 'x', snakeLength, leftBypass);
            const leftY = buildWayByAxe(boardArr, fromLeft, to, 'y', snakeLength, leftBypass);
            if(leftX && leftY){
                leftCalcWay = leftX.length < leftY.length ? leftX : leftY;
            }else{
                if(leftX) {leftCalcWay = leftX}
                if(leftY) {leftCalcWay = leftY}
            }
        }
        if(rightBypass){
            const fromRight = rightBypass[rightBypass.length - 1];
            const rightX = buildWayByAxe(boardArr, fromRight, to, 'x', snakeLength, rightBypass);
            const rightY = buildWayByAxe(boardArr, fromRight, to, 'y', snakeLength, rightBypass);
            if(rightX && rightY){
                rightCalcWay = rightX.length < rightY.length ? rightX : rightY;
            }else{
                if(rightX) {rightCalcWay = rightX}
                if(rightY) {rightCalcWay = rightY}
            }
        }
        if(leftCalcWay&&rightCalcWay){
            return leftCalcWay.length < rightCalcWay.length ? leftCalcWay : rightCalcWay;
        }
        if(leftCalcWay) return leftCalcWay;
        if(rightCalcWay) return rightCalcWay;

        if(!leftBypass && !rightBypass && Way.way.length > 0) {
            const brokenPoint = Way.way.slice(-1)[0];
            const newShortWay = Way.way.slice(0, -1);
            const newBoardArr = setBrokenLine (boardArr, Way.wayAxe, brokenPoint);
            const shortBaseWay = {...Way, way: newShortWay};
            return bypassBuilder(shortBaseWay, newBoardArr)
        }
    }
    return bypassBuilder(baseWay, oldBoardArr)
}

function setBrokenLine (boardArr, axe, point){
    const newBoardArr = [...boardArr];
    if(axe === 'y'){
        for(let i = 0; i <30; i++){
            const stepIndex = newBoardArr.findIndex(item => item.x === point.x - i && item.y === point.y);
            if(newBoardArr[stepIndex] && newBoardArr[stepIndex].el !== ELEMENT.WALL){
                newBoardArr[stepIndex].el = ELEMENT.WALL
            } else break
        }
        for(let i = 1; i <30; i++){
            const stepIndex = newBoardArr.findIndex(item => item.x === point.x + i && item.y === point.y);
            if(newBoardArr[stepIndex] && newBoardArr[stepIndex].el !== ELEMENT.WALL){
                newBoardArr[stepIndex].el = ELEMENT.WALL
            } else break
        }
    }else{
        for(let i = 0; i <30; i++){
            const stepIndex = newBoardArr.findIndex(item => item.x === point.x && item.y === point.y - i);
            if(newBoardArr[stepIndex] && newBoardArr[stepIndex].el !== ELEMENT.WALL){
                newBoardArr[stepIndex].el = ELEMENT.WALL
            } else break
        }
        for(let i = 1; i <30; i++){
            const stepIndex = newBoardArr.findIndex(item => item.x === point.x && item.y === point.y + i);
            if(newBoardArr[stepIndex] && newBoardArr[stepIndex].el !== ELEMENT.WALL){
                newBoardArr[stepIndex].el = ELEMENT.WALL
            } else break
        }
    }
    return newBoardArr
}

export function findWays (oldBoardArr, from, to, snakeLength){
    const boardArr = oldBoardArr.map(item => {
        return {x: item.x, y: item.y, el: item.el}
    });
    const boardArr2 = oldBoardArr.map(item => {
        return {x: item.x, y: item.y, el: item.el}
    });
    const waysByY = buildWayByAxe (boardArr, from, to, 'y', snakeLength);
    const waysByX = buildWayByAxe (boardArr2, from, to, 'x', snakeLength);
    if( waysByY && waysByX ){
        return waysByY > waysByX ? waysByX : waysByY
    }
    if(waysByX) return waysByX;
    if(waysByY) return waysByY
}