import { html, render } from '/node_modules/lit-html/lit-html.js';
import { LitLite } from '/lit-lite.js';

const LitElement = (superclass) => LitLite(superclass, html, render);
const {expect} = chai;
//mocha.setup('bdd');

describe('lit-element', () => {
    let testElement;
    let observerVals
    before(() => {
        observerVals = new Map;
        testElement = document.getElementById('test-el');

        class TestElement extends LitElement(HTMLElement) {
            static get properties() {
                return {
                    shortBool: Boolean,
                    longBool: {
                        type: Boolean,
                        value: true,
                        reflectToAttribute: true,
                        observer: 'boolObserver',
                        notify: true
                    },
                    shortNumber: Number,
                    longNumber: {
                        type: Number,
                        value: 123,
                        reflectToAttribute: true,
                        observer: 'numberObserver',
                        notify: true
                    },
                    stringProp: {
                        type: String,
                        value: 'StringProp'
                    }
                }
            }

            render() {
                return html`<div id="results">
                                        <span id="shortBool">${this.shortBool}</span>
                                        <span id="longBool">${this.longBool}</span>

                                        <span id="shortNumber">${this.shortNumber}</span>
                                        <span id="longNumber">${this.longNumber}</span>
                                    </div>`
            }

            boolObserver(bool) {
                observerVals.set('bool', bool);
            }

            numberObserver(num) {
                observerVals.set('number', num);
            }
        }

        customElements.define('test-element', TestElement);
    });
    describe('properties', function () {
        it('correct type', () => {
            expect(testElement.longBool).to.be.a('boolean');
            expect(testElement.longNumber).to.be.a('number');
            expect(testElement.stringProp).to.be.a('string');
        });

        it('correct value', () => {
            expect(testElement.longBool).to.be.true;
            expect(testElement.longNumber).to.equal(123);
            expect(testElement.stringProp).to.equal('StringProp')
        });

        it('changes the value', () => {
            testElement.longBool = false;
            expect(testElement.longBool).to.be.false;
            const random = Math.random() * 1000;
            testElement.longNumber = random;
            expect(testElement.longNumber).to.equal(random);
        });

        it('calls observer', () => {
            expect(observerVals.get('bool')).to.equal(testElement.longBool);
            expect(observerVals.get('number')).to.equal(testElement.longNumber);
        });
    });

    describe('attributes', () => {
        it('sets attributes after property changes', () => {
            testElement.longNumber = 123;
            expect(testElement.getAttribute('long-number')).to.equal('123');
        });

        it('removes false boolean properties', () => {
            testElement.longBool = false;
            expect(testElement.hasAttribute('long-bool')).to.be.false;
        });

        it('sets boolean attributes correctly', () => {
            testElement.longBool = true;
            expect(testElement.hasAttribute('long-bool')).to.be.true;
            expect(testElement.getAttribute('long-bool')).to.equal('');
        });

        it('changes the property', () => {
            testElement.setAttribute('long-number', '456');
            expect(testElement.longNumber).to.equal(456);

            testElement.longBool = true;
            testElement.removeAttribute('long-bool');
            expect(testElement.longBool).to.be.false;
            
            testElement.setAttribute('long-bool', '');
            expect(testElement.longBool).to.be.true;
        })
    });

    describe('Handles async property setting', () => {
        it('Sets the resolved value of a Promise to a property', done => {
            testElement.longBool = false;
            testElement.longBool = new Promise((res, rej) => {
                setTimeout(res(true), 10);
            });

            setTimeout(() => {
                expect(testElement.longBool).to.be.true;
                done();
            }, 30);
        })
    })

    describe('events', () => {
        it('fires events', done => {
            const listener = e => eventFired = true;
            let eventFired = false;
            setTimeout(() => {
                expect(eventFired, 'custom event did not fire').to.be.true;
                testElement.removeEventListener('long-bool-changed', listener);
                done();
            }, 30);

            testElement.addEventListener('long-bool-changed', listener);

            testElement.longBool = true;
            testElement.longBool = false;
        });

        it('event has correct deatil', done => {
            const listener = ({ detail }) => {
                expect(detail).to.be.true;
                testElement.removeEventListener('long-bool-changed', listener);
                done();
            };
            testElement.addEventListener('long-bool-changed',listener);

            testElement.longBool = true;
        });
    });
});