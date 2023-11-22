// Camera.js
import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

interface CameraProps {
    onCapture: (img: string) => void;
}

const Camera: React.FC<CameraProps> = ({
    onCapture
}) => {
    const webcamRef = useRef<any>(null);
    const [image, setImage] = useState(null);
    const [cameraError, setCameraError] = useState(false);

    const capture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImage(imageSrc);

            //now we send the img as prop
            onCapture(imageSrc)
        }
    };


    return (
        <div className='flex'>
            <Webcam className='rounded-lg imgPreview'
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                autoPlay={true}
                onUserMediaError={() => { setCameraError(true) }}
            />
            {!cameraError &&
                <div className='flex justify-center'>
                    <button onClick={capture} className='m-3 bg-white rounded-full w-14 h-14 self-center' id='btnCamera'>
                        <div className='w-full h-full flex justify-center'>
                            <div className='rounded-full bg-black w-12 h-12 self-center'>
                                <div className='w-full h-full flex justify-center'>
                                    <div className='bg-white rounded-full w-10 h-10 self-center'>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            }
        </div>
    );
};

export default Camera;
