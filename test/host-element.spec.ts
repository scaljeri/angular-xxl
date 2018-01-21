import { HostElement } from '../src/host-element.decorator';

export function hostElementSpecs(should): void {
    describe.only('HostElement', () => {

        it('should just be a function', () => {
            HostElement.should.be.a('function');
        });

        it('should apply currying', () => {
            HostElement().should.be.a('function');
        });
    });
}
