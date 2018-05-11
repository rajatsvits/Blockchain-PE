module.exports = {
    sortByKey:function(arr, key) {
        return arr.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            console.log(a[key]);
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    },
    sortReg:function(arr, key) {
        return arr.sort(function(a, b) {
            var x = parseInt(a[key]); var y = parseInt(b[key]);
            console.log(a[key]);
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    }
};
