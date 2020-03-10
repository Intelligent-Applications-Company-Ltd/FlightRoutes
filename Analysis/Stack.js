class Stack {
    constructor(maxSize) { // Set default max size if not provided
        if (isNaN(maxSize)) {
            maxSize = 10;
        }
        this.maxSize = maxSize; // Init an array that'll contain the stack values.
        this.container = [];
    }
    display() {
        console.log(this.container);
    }
    isEmpty() {
        return this.container.length === 0;
    }
    isFull() {
        return this.container.length >= this.maxSize;
    }
    push(element) { // Check if stack is full
        if (this.isFull()) {
            console.log("Stack Overflow!"); return;
        }
        this.container.push(element)
    }
    pop() { // Check if empty
        if (this.isEmpty()) {
            console.log("Stack Underflow!"); return;
        }
        this.container.pop()
    }
    peek() {
        if (isEmpty()) {
            console.log("Stack Underflow!");
            return;
        }
        return this.container[this.container.length - 1];
    }
    clear() {
        this.container = [];
    }
}

module.exports =  Stack;