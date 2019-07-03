import React, { Fragment, useEffect, useState, useRef } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';

const App = () => {
    const [expressions, setExpressions] = useState({});
    // de-structuring state for ease of use and convenience
    const { neutral, happy, sad, angry, fearful, disgusted, surprised } = expressions;
    // use refs to prevent direct state mutations and have a reference point
    const exp = useRef(0);
    let currentExp = exp.current;
    const getExpressions = () => {
        setExpressions(currentExp);
    }

    // assuming your models are located in /public/models
    const myPromises = async () => {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]).then(startVideo);
    }

    const startVideo = async () => {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                const video = document.querySelector('#video');
                video.srcObject = stream;
                video.addEventListener('play', () => {
                    setInterval(async () => {
                        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks().withFaceExpressions();
                        // handling error to prevent error boundary development overlay from displaying
                        if (!detections[0]) {
                            console.log("No detections.");
                        } else {
                            currentExp = detections[0].expressions;
                            // mutate state via refs and get frontend changes instantly
                            getExpressions();
                        }
                    }, 300)
                });
            })
            .catch(err => console.error(err));
        }
    }

    useEffect(() => {
        // fetches models on initial component render and starts camera afterwards (thenable)
        myPromises();
    }, []);

    return (
        <Fragment>
            <video
            id="video"
            autoPlay={true}
            muted={true}>
            </video>
            <div className="results">
                <div>Neutral: { Math.round(neutral) }</div>
                <div>Happy: { Math.round(happy) }</div>
                <div>Sad: { Math.round(sad) }</div>
                <div>Angry: { Math.round(angry) }</div>
                <div>Fearful: { Math.round(fearful) }</div>
                <div>Disgusted: { Math.round(disgusted) }</div>
                <div>Surprised: { Math.round(surprised) }</div>
            </div>
        </Fragment>
    );
}

export default App;
