let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../code_app');

let postId = 0;
let putId = 0;
let deleteId = 0;

// Assertion style
chai.should();

chai.use(chaiHttp);


describe('Testing languages', () => {

    describe('get acceuil', () => {
        it('Should POST a language', (done) => {
            chai.request(server)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

    });

    describe('POST /languages', () => {
        it('Should POST a language', (done) => {
            chai.request(server)
                .post('/languages?Name=language')
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property("Create");
                    res.body.should.have.property('Create').eq(true);
                    done();
                });
        });
    });

    describe('GET /languages', () => {
        it('Should GET all languages', (done) => {
            chai.request(server)
                .get('/languages')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.above(0);
                    done();
                });
        });
    });

    describe('PUT /languages?LanguageId', () => {
        it('Should PUT a language', (done) => {
            chai.request(server)
                .put('/languages?LanguageId=' + postId + '&Name=update')
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('Update');
                    res.body.should.have.property('Update').eq(true);
                    done();
                });
        });

        it('Should NOT PUT a language with an ID which does not exist', (done) => {
            chai.request(server)
                .put('/languages?LanguageId=0&Name=update')
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });

    });

    describe('Delete /languages?LanguageId', () => {
        it('Should Delete a language', (done) => {
            chai.request(server)
                .put('/languages?LanguageId=' + postId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('Delete');
                    res.body.should.have.property('Delete').eq(true);
                    done();
                });
        });

        it('Should NOT Delete a language with an ID which does not exist', (done) => {
            chai.request(server)
                .delete('/languages?LanguageId=0')
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });

    });
});
