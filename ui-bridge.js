import { syncBusinessOnboarding } from './backend-logic.js';

// 1. Wait for the button to exist on the screen
document.addEventListener('DOMContentLoaded', () => {
    
    // 2. Find your "Onboard Business" form
    const onboardingForm = document.querySelector('#onboardingForm'); 

    if (onboardingForm) {
        onboardingForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stops the page from refreshing
            
            // 3. Grab the data from your input fields
            const formData = new FormData(onboardingForm);
            const businessData = {
                name: formData.get('businessName'), // Matches 'name' attribute in HTML
                category: formData.get('category'),
                phone: formData.get('phone'),
                location: "Gaborone", // Example static data
                amountPaid: 350
            };

            try {
                // 4. THE MAGIC: Call the AI-generated logic to sync to cloud
                const docId = await syncBusinessOnboarding(businessData);
                alert("Hustle Synced! Document ID: " + docId);
                onboardingForm.reset();
            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }
});
