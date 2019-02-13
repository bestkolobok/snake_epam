import {ELEMENT} from "./constants";
// import {getWayLength} from "./utils";
import {findWays} from "./wayUtils";


export function getNextPosition (boardFullArray, position, element = 'GOLD', snakeLength, skipElements = []){
    console.log('getNextPosition', element);
    let elementsArr = [];
    if(typeof(element) === 'string'){
        elementsArr = boardFullArray.filter(item => item.el === ELEMENT[element]);
    }else{
        elementsArr = boardFullArray.filter(item => {
            return element.findIndex(itemEl=> item.el === ELEMENT[itemEl]) !== -1;
        });
    }
    return elementsArr.reduce((acc,item) => {
        if (acc.x && acc.y) {
            const isSkip = skipElements.findIndex(el=> el.x === item.x && el.y === item.y) !== -1;
            const arrItem = findWays(boardFullArray, position, item, snakeLength);
            const arrAcc = findWays(boardFullArray, position, acc, snakeLength);
            if(arrItem && arrAcc && arrItem.length < arrAcc.length &&
                !((position.x === item.x && position.y === item.y) || isSkip)
            ) return {x: item.x, y: item.y};
            return acc
        }
        return {x: item.x, y: item.y}
    }, {});
}