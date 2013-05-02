function HashTable() {
    this.items = {};
    this.count = 0;
}
HashTable.prototype.getKey = function (o) {
    return o.id;
}
HashTable.prototype.add = function (key, value) {
    if (arguments.length === 1) {
        value = key;
        key = this.getKey(value);
    }
    this.items[key] = value;
    ++this.count;
    return value;
}
HashTable.prototype.remove = function(o){
    var key = this.findKey(o);
    if (key !== undefined) {
        return this.removeAtKey(key);
    }
    return false;
}
HashTable.prototype.removeAtKey = function (key) {
    if (this.containsKey(key)) {
        delete this.items[key];
        --this.count;
        return true;
    }
    return false;
}
HashTable.prototype.clear = function () {
    this.items = {};
    this.count = 0;
    return this;
}
HashTable.prototype.contains = function(value){
    return this.containsKey(this.findKey(value));
}
HashTable.prototype.containsKey = function (key) {
    return this.items[key] !== undefined;
}
HashTable.prototype.get = function (key) {
    return this.items[key];
}
HashTable.prototype.getCount = function(){
    return this.count;
}
HashTable.prototype.getKeys = function(){
    return this.getArray(true);
}
HashTable.prototype.getValues = function(){
    return this.getArray(false);
}
HashTable.prototype.getArray = function (isKey) {
    var arr = [];
    var items = this.items;
    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            arr.push(isKey ? key : items[key]);
        }
    }
    return arr;
}
HashTable.prototype.each = function (fn, scope) {
    var items = this.items;
    var count = this.count;
    var scope = scope || this;

    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            if (fn(scope, key, items[key], count) === false) {
                break;
            }
        }
    }
    return this;
}
HashTable.prototype.findKey = function (value) {
    var items = this.items;
    for (var key in items) {
        if (items.hasOwnProperty(key) && items[key] === value) {
            return key;
        }
    }
    return undefined;
}
