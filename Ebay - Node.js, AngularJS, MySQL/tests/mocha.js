/**
 * Created by Salmaan on 10/16/2016.
 */

var express = require('express');
var request = require('request');
var assert = require('assert');
var http = require('http');
var mocha = require('mocha');

describe('API tests', function () {


    it('should login', function(done) {
        request.post(
            'http://localhost:3000/signin',
            { form: { signin_handle: 'salmaan',signin_password:'test' } },
            function (error, response, body) {
                assert.equal(200, response.statusCode);
                done();
            }
        );
    });



    it('should display recent ads', function(done){

        http.get('http://localhost:3000/getRecentAds', function(res){
            assert.equal(200, res.statusCode);
            done();
        });
    });

    it('should render cart page', function(done){

        http.get('http://localhost:3000/getCart', function(res){
            assert.equal(200, res.statusCode);
            done();
        });
    });

    it('should display 404, as advertisement doesnt exist', function(done){

        http.get('http://localhost:3000/getAdDetails/9999', function(res){
            assert.equal(404, res.statusCode);
            done();
        });
    });

    it('should display profile page', function(done){

        http.get('http://localhost:3000/profile/salmaan', function(res){
            assert.equal(200, res.statusCode);
            done();
        });
    });



});

