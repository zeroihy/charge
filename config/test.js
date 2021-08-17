function containsNumber (str) {
    let reg = /\d/;
    let result = reg.test(str);
    console.log(result);
    return result
}
containsNumber("dsdasda111")