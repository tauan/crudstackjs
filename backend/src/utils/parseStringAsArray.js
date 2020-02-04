module.exports = function paseStringAsArray(stringAsArray) {
    return stringAsArray.split(',').map(item=> item.trim())
}
