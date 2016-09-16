import Database from '../../data/database';
import { expect } from 'chai';

const db = new Database(
	'key',
	'secret',
	'us-east-1',
	'http://localhost:7777/');
const File = db.File;

function testValidation(item, failMessage, callback) {
	File.createAsync(item)
		.then(() => callback(failMessage))
		.catch(err => {
			expect(err.cause.name).to.equal('ValidationError');
			callback();
		});
}

describe('File class', () => {

	describe('validation', () => {

		let file = {};

		beforeEach(() => {
			const date = (new Date()).getTime();
			const expires = Date.parse('January 5, 2025');
			file = {
				checksum: 'aoewigh3240239r3rhf0m30fj0324',
				format: 'pdf',
				createdAt: date,
				expires: expires,
				path: 'mytenant/aoewigh3240239r3rhf0m30fj0324.pdf'
			};
		});

		it('prevents missing checksum', done => {
			file.checksum = undefined;
			testValidation(file, 'File was saved without an MD5 checkum.', done);
		});

		it('prevents missing format', done => {
			file.format = undefined;
			testValidation(file, 'File was saved without a format.', done);
		});

		it('prevents invalid format', done => {
			file.format = 'mp3';
			testValidation(file, 'File was saved with an invalid format.', done);
		});

		it('prevents missing created at date', done => {
			file.createdAt = undefined;
			testValidation(file, 'File was saved without a Created At date.', done);
		});

		it('prevents non-numeric created at date', done => {
			file.createdAt = '2015-03-25T12:00:00';
			testValidation(file, 'File was saved with a non-numeric Created At date.', done);
		});

		it('prevents missing expiration date', done => {
			file.expires = undefined;
			testValidation(file, 'File was saved without an expiration date.', done);
		});

		it('prevents non-numeric expiration date', done => {
			file.expires = '2015-03-25T12:00:00';
			testValidation(file, 'File was saved with a non-numeric expiration date.', done);
		});

		it('prevents missing path', done => {
			file.path = undefined;
			testValidation(file, 'File was saved without a path.', done);
		});
	});

	describe('CRUD operations', () => {
		let file = {};

		beforeEach(() => {
			const date = (new Date()).getTime();
			const expires = Date.parse('January 5, 2025');
			file = {
				checksum: 'aoewigh3240239r3rhf0m30fj0324',
				format: 'pdf',
				createdAt: date,
				expires: expires,
				path: 'mytenant/aoewigh3240239r3rhf0m30fj0324.pdf'
			};
		});

		afterEach(done => {
			File.destroyAsync(file.checksum, file.format)
				.then(() => done())
				.catch(err => done(err));
		});

		it('can save a file record', done => {
			File.createAsync(file)
				.then(() => {
					return File.getAsync(
						file.checksum,
						file.format);
				})
				.then(result => {
					expect(result).to.exist;
					expect(result.get('checksum')).to.equal(file.checksum);
					expect(result.get('format')).to.equal(file.format);
					expect(result.get('createdAt')).to.equal(file.createdAt);
					expect(result.get('expires')).to.equal(file.expires);
					expect(result.get('path')).to.equal(file.path);
					done();
				})
				.catch(err => done(err));
		});

		it('can update existing file records', done => {
			file.checksum = '79054025255fb1a26e4bc422aef54eb4';

			File.createAsync(file)
				.then(() => {
					file.expires = (new Date()).getTime();
					file.path = 'my-new-path-is-better/whatevs';

					return File.updateAsync(file);
				})
				.then(() => {
					return File.getAsync(
						file.checksum,
						file.format);
				})
				.then(result => {
					expect(result).to.exist;
					expect(result.get('checksum')).to.equal(file.checksum);
					expect(result.get('format')).to.equal(file.format);
					expect(result.get('createdAt')).to.equal(file.createdAt);
					expect(result.get('expires')).to.equal(file.expires);
					expect(result.get('path')).to.equal(file.path);
					done();
				})
				.catch(err => done(err));
		});

		it('can delete file records', done => {
			file.checksum = 'd41d8cd98f00b204e9800998ecf8427e';

			File.createAsync(file)
				.then(() => {
					return File.destroyAsync(
						file.checksum,
						file.format);
				})
				.then(() => {
					return File.getAsync(
						file.checksum,
						file.format);
				})
				.then(result => {
					expect(result).to.be.null;
					done();
				})
				.catch(err => done(err));
		});
	});

});