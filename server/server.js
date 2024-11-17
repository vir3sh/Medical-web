const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const Patient = require('./models/Patient');  // Correct the import from Doctor to Patient
const Doctor = require('./models/Doctor');  // Import Doctor model
const jwt = require('jsonwebtoken');
const messageRoutes = require('./routes/messageRoutes'); 
const Message = require('./models/Message');
const Consultation = require('./models/Consultation');
const patientRoutes = require('./routes/patientRoutes');

const app = express();
const router = express.Router();  // Create a router instance

dotenv.config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));
// Middleware setup

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
// app.use('/api/patients', patientRoutes);

// Set up Multer for handling file uploads (e.g., profile pictures)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Assign a unique name for the file
  }
});
const upload = multer({ storage: storage });


router.get('/api/patients/:id/profilePicture', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if the patient has a profile picture
    if (!patient.profilePicture) {
      return res.status(404).json({ message: 'No profile picture available' });
    }

    // Construct the full URL to the profile picture
    const profilePictureUrl = `http://localhost:5000${patient.profilePicture}`;
    
    res.json({ profilePictureUrl });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Patient Registration Route
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { name, age, email, phone, historyOfSurgery, historyOfIllness, password } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password || !historyOfSurgery || !historyOfIllness) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the patient already exists by email or phone
    const existingPatient = await Patient.findOne({ $or: [{ email }, { phone }] });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient with this email or phone already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient object
    const patient = new Patient({
      profilePicture: req.file ? `/uploads/${req.file.filename}` : null, // Save relative path for profile picture
      name,
      age,
      email,
      phone,
      historyOfSurgery,
      historyOfIllness,
      password: hashedPassword, // Save the hashed password
    });

    // Save the patient to the database
    await patient.save();
    res.status(201).json({ message: 'Patient registered successfully' });
  } catch (error) {
    console.error('Error during patient registration:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Patient Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with an expiration time
    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send success response with token and patient details
    res.status(200).json({
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        profilePicture: patient.profilePicture || null, // Include profile picture if available
      },
    });
  } catch (error) {
    console.error('Error during login:', error); // Log error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// router.post('/consultations/:doctorId', async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const { currentIllness, recentSurgery, familyHistory, consultationDetails } = req.body;

//     // Create the new consultation document
//     const newConsultation = new Consultation({
//       doctorId,
//       currentIllness,
//       recentSurgery,
//       familyHistory,
//       consultationDetails,
//     });

//     // Save the consultation to the database
//     const savedConsultation = await newConsultation.save();

//     // Find the doctor and send them a notification (e.g., email, SMS)
//     const doctor = await Doctor.findById(doctorId);
//     if (doctor) {
//       // Send notification to the doctor (via email or SMS)
//       // Example: sendEmailToDoctor(doctor.email, savedConsultation);
//     }

//     res.status(201).json({
//       message: 'Consultation submitted successfully!',
//       consultation: savedConsultation,
//     });
//   } catch (error) {
//     console.error('Error saving consultation:', error);
//     res.status(500).json({ message: 'Error saving consultation' });
//   }
// });

router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find(); // Fetch all doctors from the database
    res.status(200).json(doctors); // Send the list of doctors
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
// Register and Login routes for Doctor
// Doctor Registration
router.post('/doctors/register', upload.single('profilePicture'), async (req, res) => {
  const { name, specialty, email, phone, yearsOfExperience, password, profilePictureURL } = req.body;

  try {
    // Check if a doctor already exists with the provided email or phone
    const existingDoctor = await Doctor.findOne({ $or: [{ email }, { phone }] });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Determine the profile picture to use (file upload takes priority)
    let profilePicture = null;
    if (req.file) {
      profilePicture = req.file.path; // Use uploaded file path
    } else if (profilePictureURL) {
      profilePicture = profilePictureURL; // Use provided URL
    }

    // Create a new doctor instance
    const doctor = new Doctor({
      profilePicture,
      name,
      specialty,
      email,
      phone,
      yearsOfExperience,
      password,
    });

    // Save doctor to the database
    await doctor.save();

    res.status(201).json({ message: 'Doctor added successfully', doctor });
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find(); // Fetch all patients
    res.status(200).json(patients); // Respond with the patients
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error fetching patients', error });
  }
});


// Doctor Login
router.post('/doctors/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Compare passwords (using bcrypt if you hashed the password)
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create and send a JWT token
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the response containing the doctor details and token
    res.status(200).json({
      message: 'Login successful',
      token, // Include the JWT token in the response
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        profilePicture: doctor.profilePicture, // If you have a profile picture
      },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/doctors/:doctorId', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId); // Replace with your DB lookup
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor); // Return doctor details
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/consultations', async (req, res) => {
  const {
    doctorId,
    patientName,
    appointmentDate,
    symptoms,
    illnessHistory,
    recentSurgery,
    diabetes,
    allergies,
    others,
  } = req.body;

  try {
    // Assuming you have a Consultation model to save data
    const consultation = new Consultation({
      doctorId,
      patientName,
      appointmentDate,
      symptoms,
      illnessHistory,
      recentSurgery,
      diabetes,
      allergies,
      others,
    });

    // Save the consultation data to the database
    await consultation.save();

    // Respond with a success message
    res.status(201).json({ message: 'Consultation created successfully', consultation });
  } catch (error) {
    console.error('Error saving consultation:', error);
    res.status(500).json({ message: 'Failed to create consultation' });
  }
});

router.post('/doctors/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received:', { email, password }); // Log the request data
  try {
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        profilePicture: doctor.profilePicture,
      },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/messages/:doctorId', async (req, res) => {
  const { doctorId } = req.params; // Extract doctorId from the route
  const { patientId, illnessHistory, recentSurgery, isDiabetic, allergies, others } = req.body;

  try {
    const message = new Message({
      doctorId,
      patientId,
      illnessHistory,
      recentSurgery,
      isDiabetic,
      allergies,
      others,
      sentAt: new Date(),
    });

    await message.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to send the message.' });
  }
});

app.get('/api/messages/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  try {
    const messages = await Message.find({ doctorId: doctorId }).populate('patientId');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server error');
  }
});


// In your Express backend
app.post('/api/consultations/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  const { illnessHistory, recentSurgery, isDiabetic, allergies, others } = req.body;

  try {
    // Save consultation data to database
    const consultation = await Consultation.create({
      doctor: doctorId,
      patient: req.user.id, // Assuming patient info is in req.user
      illnessHistory,
      recentSurgery,
      isDiabetic,
      allergies,
      others,
    });

    res.status(201).json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create consultation.' });
  }
});

// Example backend endpoint
app.post('/api/messages/reply/:messageId', async (req, res) => {
  const { messageId } = req.params;
  const { careToBeTaken, medicines, replyDate, patientId, doctorId } = req.body;

  try {
    // Find the message by ID
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).send('Message not found');

    // Prepare the reply object
    const replyData = {
      careToBeTaken,
      medicines,
      replyDate,
      doctorId,
    };

    // Save the reply to the message
    message.reply = replyData;
    await message.save();

    // Find the patient by ID and save the reply to their record
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).send('Patient not found');

    if (!patient.replies) {
      patient.replies = []; // Ensure the replies array exists
    }
    patient.replies.push({
      ...replyData,
      messageId, // Keep track of which message this reply corresponds to
    });

    await patient.save(); // Save the updated patient record

    res.status(200).send('Reply sent and saved to patient record successfully');
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).send('Failed to send reply');
  }
});
// Example backend endpoint to get replies for a specific patient
router.get('/messages/replies/patient/:patientId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).populate({
      path: 'replies.doctorId', // Populate the doctorId in replies
      select: 'name', // Select only the doctor's name
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const replies = patient.replies.map(reply => ({
      doctorName: reply.doctorId ? reply.doctorId.name : 'Unknown', // If doctor is null or undefined, set default value
      careToBeTaken: reply.careToBeTaken,
      medicines: reply.medicines,
      replyDate: reply.replyDate,
      messageId: reply.messageId,
    }));

    res.json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor' });
  }
});


router.get('/patients/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Find the patient by ID
    const patient = await Patient.findById(patientId).select('-password'); // Exclude password field for security

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Send patient details as response
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete patient
router.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient' });
  }
});

// Update doctor
router.put('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor' });
  }
});

// Update patient
router.put('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient' });
  }
});


// Use the routes
app.use('/api', router); // Apply the routes to /api path
// app.use('/api/messages', messageRoutes); 
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
