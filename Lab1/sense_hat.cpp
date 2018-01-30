//////////////////////////////////////////////////////////////////////////
//
//
//  This file is part of RTIMULib
//
//  Copyright (c) 2014-2015, richards-tech, LLC
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy of
//  this software and associated documentation files (the "Software"), to deal in
//  the Software without restriction, including without limitation the rights to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
//  Software, and to permit persons to whom the Software is furnished to do so,
//  subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
//  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
//  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#include "RTIMULib.h"

#define NUM_READINGS 10

int main()
{
    int sampleCount = 0;
    int sampleRate = 0;
    uint64_t rateTimer;
    uint64_t displayTimer;
    uint64_t now;

    //  using RTIMULib here allows it to use the .ini file generated by RTIMULibDemo.

    RTIMUSettings *settings = new RTIMUSettings("RTIMULib");
    RTIMU *imu = RTIMU::createIMU(settings);
    RTPressure *pressure = RTPressure::createPressure(settings);
    RTHumidity *humidity = RTHumidity::createHumidity(settings);

    if ((imu == NULL) || (imu->IMUType() == RTIMU_TYPE_NULL))
    {
        printf("No IMU found\n");
        exit(1);
    }

    //  This is an opportunity to manually override any settings before the call IMUInit
    //  set up IMU
    imu->IMUInit();

    //  this is a convenient place to change fusion parameters
    imu->setSlerpPower(0.02);
    imu->setGyroEnable(true);
    imu->setAccelEnable(true);
    imu->setCompassEnable(true);

    //  set up pressure sensor
    if (pressure != NULL)
    {
        pressure->pressureInit();
    }

    //  set up humidity sensor
    if (humidity != NULL)
    {
        humidity->humidityInit();
    }

    //  set up for rate timer
    rateTimer = displayTimer = RTMath::currentUSecsSinceEpoch();

    //  now just process data
    while (1)
    {
        /* HINT: The whole purpose of the weird way this is written is to poll the
         *       IMU its recommended rate, but display the data at a rate that may be different.
         *       Not polling at the correct rate can result in weird readings.
         */

        double average_yaw = 0;
        double average_pitch = 0;
        double average_roll = 0;
        double average_temp = 0;

        double yaws[NUM_READINGS];
        double pitches[NUM_READINGS];
        double rolls[NUM_READINGS];
        double temps[NUM_READINGS];

        int pointer = 0;

        //  poll at the rate recommended by the IMU
        usleep(imu->IMUGetPollInterval() * 1000);
        while (imu->IMURead())
        {
            RTIMU_DATA imuData = imu->getIMUData();

            //  add the pressure data to the structure
            if (pressure != NULL)
            {
                pressure->pressureRead(imuData);
            }

            sampleCount++;

            now = RTMath::currentUSecsSinceEpoch();

            //  display 1 time per second

            //  HINT: The code inside this "if" statement executes once per second.
            //        Put all of your code to print/calculate current and average IMU data inside here.
            //        You shouldn't need to modify anything outside of this "if" statement.
            //        The IMU is polled at the recommended rate, but this "if" statement ensures that the
            //        values are only displayed at a certain interval.
            if ((now - displayTimer) > 1000000) {
                RTFLOAT roll = imuData.fusionPose.x() * RTMATH_RAD_TO_DEGREE;
                RTFLOAT pitch = imuData.fusionPose.y() * RTMATH_RAD_TO_DEGREE;
                RTFLOAT yaw = imuData.fusionPose.z() * RTMATH_RAD_TO_DEGREE;
                RTFLOAT temp = imuData.temperature;

                yaws[pointer] = yaw;
                pitches[pointer] = pitch;
                rolls[pointer] = roll;
                temps[pointer] = temp;

                average_yaw += yaws[pointer];
                average_pitch += pitches[pointer];
                average_roll += rolls[pointer];
                average_temp += temps[pointer];

                pointer += 1;
                pointer %= NUM_READINGS;

                average_yaw -= yaws[pointer];
                average_pitch -= pitches[pointer];
                average_roll -= rolls[pointer];
                average_temp -= temps[pointer];

                printf("Sample rate %d: %s\n", sampleRate, RTMath::displayDegrees("", imuData.fusionPose));

                if (pressure != NULL) {
                    printf("\n");
                    printf("average roll: %4.1f, average pitch: %4.1f, average yaw: %4.1f, average temp: %4.1f",
                            average_roll, average_pitch, average_yaw, average_temp);
                    printf("\n");
                    printf("roll: %4.1f, pitch: %4.1f, yaw: %4.1f, temp: %4.1f",
                        roll, pitch, yaw, temp);
                }

                printf("\n");
                fflush(stdout);
                displayTimer = now;//HINT: LEAVE THIS LINE ALONE!!!

            }

            //  update rate every second
            if ((now - rateTimer) > 1000000) {
                sampleRate = sampleCount;
                sampleCount = 0;
                rateTimer = now;
            }
        }
    }
}
