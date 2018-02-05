/*********************************************
 * Programmer(s): Bakir Hajdarevic, Luka Zdilar
 * Program: lab1_arduino_Group5-BH-LZ.cpp
 * Date: 1/30/2018
 * Description: This program reads from a TMP36
 * temperature sensor and displays to the command
 * line every 1 second.
 *********************************************/

// Initialize program global variable(s)
int   sensorPin = 0;      // Analog pin of the TMP36's Vout
int   numSmp = 0;         // Number of samples initially acquired
int   numSmpsAve = 10;    // Number of samples to average in function
int   indexSmp = 0;       // Variable to index last sample acquired
float tempSmpArr[10];     // Array for storing last 10 temperature samples
float number_smps = 10;   // Numebr of samples to average

// Set the baud rate before main loop
void setup() {
    // Start the serial connection with the computer
    Serial.begin(9600);
}

// Main loop
void loop()
{
    // Get the votlage reading from the temperature sensor
    int reading = analogRead(sensorPin);

    // Convert analog reading to voltage
    float voltage = reading * 5.0;
    voltage /= 1024.0;

    float temperatureC = (voltage - 0.5) * 100;

    Serial.print("Current temperature: ");
    Serial.print(temperatureC);
    Serial.println(" degrees C" );

    // Make sure 10 samples are acquired before computing average
    if (numSmp < numSmpsAve)
    {
        tempSmpArr[numSmp] = temperatureC;
        numSmp++;
    }
    else if (numSmp >= numSmpsAve)
    {
        // Display average temperature for 10 samples
        Serial.print("Average Temperature for ");
        Serial.print(numSmpsAve);
        Serial.print(" samples: ");
        Serial.print(computeTempAve(tempSmpArr));
        Serial.println(" degrees C");

        // Store current temperature
        tempSmpArr[indexSmp] = temperatureC;
        indexSmp++;

        if (indexSmp == 10)
        {
            // Reset to beginning of array
            indexSmp = 0;
        }

    }

    // Make sure to acquire only every 1 second
    delay(1000);
}

// Function for computing average temperature
float computeTempAve(float tempArr[])
{
    // Initialize variable for storing sum of temperature in array
    float sum = 0;

    for(int i = 0; i < numSmpsAve; i++)
    {
        sum += tempArr[i];
    }

    // Return average temperature within array
    return sum/number_smps;
}
