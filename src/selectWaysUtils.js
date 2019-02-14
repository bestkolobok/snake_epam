import {ELEMENT} from "./constants";
// import {getWayLength} from "./utils";
import {findWays} from "./wayUtils";


export function getNextPosition (boardFullArray, position, element = 'GOLD', snakeLength, skipElements = []){
    // console.log('getNextPosition', element);
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

export function getFullElements(boardFullArray, element = 'GOLD'){
    let elementsArr = [];
    if(typeof(element) === 'string'){
        elementsArr = boardFullArray.filter(item => item.el === ELEMENT[element]);
    }else{
        elementsArr = boardFullArray.filter(item => {
            return element.findIndex(itemEl=> item.el === ELEMENT[itemEl]) !== -1;
        });
    }
    return elementsArr
}

export function selectWays(boardFullArray, elements, position, weight = {}, snakeLength, isFury){
    return elements.map(element => {
        const wayToElement = findWays(boardFullArray, position, element, snakeLength, isFury);
        const lengthToElement = wayToElement ? wayToElement.length : Infinity;
        let absWeight = 0;
        if (element.el === ELEMENT.APPLE){absWeight = weight.APPLE}
        if (element.el === ELEMENT.STONE){absWeight = weight.STONE}
        if (element.el === ELEMENT.GOLD){absWeight = weight.GOLD}
        if (element.el === ELEMENT.FURY_PILL){absWeight = weight.FURY_PILL}
        if (element.el === ELEMENT.FLYING_PILL){absWeight = weight.FLYING_PILL}
        if (element.el === ELEMENT.ENEMY_STRING){absWeight = weight.ENEMY}

        const relativeWeight = absWeight/lengthToElement;
        return {...element, weight: relativeWeight, way: wayToElement}
    });
}


// export function calcWay (boardFullArray, elements, weight = {}, snakeLength, ways = [], skipElements = [], level = 0){
//     const fullSkipElements = [...skipElements];
//     const calculatedWays = ways.map(elWay => {
//         const newSkipElements = [...skipElements];
//         newSkipElements.push({x: elWay.x, y: elWay.y, el: elWay.el});
//         const cleanElements = elements.reduce((acc, el) => {
//             const skippedElement = fullSkipElements.findIndex(skip => skip.x === el.x && skip.y === el.y);
//             if(skippedElement === -1 && elWay.x !== el.x && elWay.y !== el.y) {
//                 acc.push(el)
//             }
//             return acc
//         }, []);
//
//         const weightedElements = cleanElements.map(element => {
//             const wayToElement = findWays(boardFullArray, elWay, element, snakeLength);
//             const lengthToElement = wayToElement ? wayToElement.length : Infinity;
//             let absWeight = 0;
//             if (element.el === ELEMENT.APPLE){absWeight = weight.APPLE}
//             if (element.el === ELEMENT.STONE){absWeight = weight.STONE}
//             if (element.el === ELEMENT.GOLD){absWeight = weight.GOLD}
//             if (element.el === ELEMENT.FURY_PILL){absWeight = weight.FURY_PILL}
//             if (element.el === ELEMENT.FLYING_PILL){absWeight = weight.FLYING_PILL}
//             const relativeWeight = absWeight/lengthToElement;
//             return {...element, weight: relativeWeight, way: wayToElement}
//         });
//
//         const maxWeight =  weightedElements.reduce((acc, elem) => {
//             return elem.weight > acc ? elem.weight : acc
//         }, 0);
//         const sumWeight = elWay.weight + maxWeight;
//         return {...elWay, weight: sumWeight}
//         // return calcWays(boardFullArray, elements, weight = {}, snakeLength, weightedElements, newSkipElements, level+1)
//     });
//     return  calculatedWays.reduce((acc, elem) => {
//         return elem.weight > acc.weight ? elem : acc
//     }, {weight: 0});
// }

export function calcWay (boardFullArray, elements, weight = {}, snakeLength, ways = []){
    return  ways.reduce((acc, elem) => {
        return elem.weight > acc.weight ? elem : acc
    }, {weight: 0});
}