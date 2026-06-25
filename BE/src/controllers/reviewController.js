const prisma = require('../configs/database');


const getAllReviewByHotel = async (req , res) => {
    try {
       const {id} = req.params;
       const getReview = await prisma.reviews.findMany({
        where : {
            hotel_id : Number(id)
        },
        select : {
            review_id: true,
            rating : true ,
            comment: true ,
            created_at: true,
            users : {
                select: {
                    full_name : true
                }
            } ,
            hotels : {
                select :{
                    hotel_name : true
                }
            }
        }
       }); 
       return res.status(200).json({
        message : "success" ,
        data : getReview
       });
    } catch (error) {
        return res.status(500).json({
            message :"server error: " + error.message
        });
    }
};

const createReview = async (req, res) => {
  try {
    const { hotel_id, rating, comment } = req.body;
    const user_id = req.user ? req.user.user_id : req.body.user_id;

    // 1. Kiểm tra xem Người dùng (User) có tồn tại thật không
    const userExists = await prisma.users.findUnique({
      where: { user_id: Number(user_id) }
    });
    
    // 2. Kiểm tra xem Khách sạn (Hotel) có tồn tại thật không
    const hotelExists = await prisma.hotels.findUnique({
      where: { hotel_id: Number(hotel_id) }
    });

    if (!userExists || !hotelExists) {
      return res.status(400).json({
        message: "Người dùng hoặc khách sạn không tồn tại trên hệ thống."
      });
    }

    const newReview = await prisma.reviews.create({
      data: {
        user_id: Number(user_id),
        hotel_id: Number(hotel_id),
        rating: rating ? Number(rating) : undefined,
        comment: comment ? String(comment) : undefined
      },
      include: {
        users: {
          select: {
            full_name: true
          }
        }
      }
    });

    return res.status(201).json({
      message: "Viết đánh giá thành công!",
      data: newReview
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message
    });
  }
};

const deleteReview = async (req,res)=>{
    try {
        const {id} = req.params;
        const checkReview = await prisma.reviews.findUnique({
            where :{
                review_id : Number(id)
            }
        });
        if(!checkReview){
            return res.status(404).json({
                message : "Không tìm thấy đánh giá"
            });
        }

        if (req.user && req.user.role !== 2 && req.user.user_id !== checkReview.user_id) {
          return res.status(403).json({
            message: "Không có quyền xóa đánh giá này"
          });
        }

        await prisma.reviews.delete({
            where: {
                review_id : Number(id)
            }
        });

        return res.status(200).json({
            message: "Xóa đánh giá thành công"
        });
    } catch (error) {
        return res.status(500).json({
            message : "server error: " + error.message
        });
    }
};

module.exports = {
    getAllReviewByHotel,
    createReview,
    deleteReview
};
