const request = require('supertest');
const app = require('../src/server');

describe('API Tests', () => {
    it('should return the sum of two numbers', async () => {
        const response = await request(app).get('/plus/5/6');
        expect(response.status).toBe(200);
        expect(response.body.num1).toBe(5);
        expect(response.body.num2).toBe(6);
        expect(response.body.plus).toBe(11);
    });

    it('should return an error if the expression of two numbers is not valid', async () => {
        const response = await request(app).get('/plus/5.5.5/6.6.6');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('parameters are not valid numbers');
    });

    it('should return an error if parameters are not numbers', async () => {
        const response = await request(app).get('/plus/foo/bar');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('parameters are not valid numbers');
    });
});
