const { instance } = require("../config/razorpay");
const Course = require("../models/User");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/template/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

// capture the payment and initiaite the RazorPay order
exports.capturePayment = async (req, res) => {
    try {
        // get courseId and userId
        const { course_id } = req.body;
        const userId = req.user.id;
        // validation
        // valid courseId
        if (!course_id) {
            return res.json({
                success: false,
                message: "Please provide valid course Id"
            });
        }
        // valid courseDetails
        let course;
        try {
            course = await Course.findById(course_id);
            if (!course) {
                return res.json({
                    success: false,
                    message: "Course not find the course"
                });
            }
            // user already pay for the same course
            const uid = mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({
                    success: false,
                    message: "Student is already enrolled"
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
        // order create
        const options = {
            amount: course.price * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString(),
            notes: {
                course_id,
                userId
            }
        };

        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            // return res
            return res.status(200).json({
                success: true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount
            })
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                message: "Could not initiate order"
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Could not capture payment"
        })
    }
}


// verify Signature of Razorpay and Server

exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
        console.log("Payment is Authorised");
        const { course_id, userId } = req.body.payload.payment.entity.notes;

        try {
            // fulfil the action
            // find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: course_id },
                { $push: { enrolledStudents: userId } },
                { new: true }
            );

            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found"
                });
            }

            console.log(enrolledCourse);

            // find the student and add the course to its list enrolled courses me
            const enrolledStudent = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { courses: course_id } },
                { new: true }
            )
            console.log(enrolledStudent);

            // confirmation mail sned 
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Enrollment Successfull",
                "You have been successfully enrolled into the course " + enrolledCourse.name
            );

            console.log(emailResponse);
            // return res
            return res.status(200).json({
                success: true,
                message: "Signature Verified and Course Added"
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    else{
        return res.status(400).json({
            success: false,
            message: "Invalid Signature"
        })
    }


}