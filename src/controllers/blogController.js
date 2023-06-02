const { isValidObjectId } = require("mongoose")
const blogModel = require("../models/blogModel")
const validator = require('../utils/validator')

const createBlog = async (req, res) => {
    try {

        let data = req.body
        let {title,body,tags,category,subcategory,authorId} = data

        if(!validator.isValidRequestBody){
            return res.status(400).send({ status: false, message: "No data is present in body" });
        }
        
        // title validation

        if(!title) {
            return res.status(400).send({ status: false, message: "title is required" });
        }
        if(!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "enter valid title" })
        }

        // body validation

        if(!body) {
            return res.status(400).send({ status: false, message: "body is required" });
        }
        if(!validator.isValid(body)) {
            return res.status(400).send({ status: false, message: "enter valid body" })
        }

        // // authorId validation
        if (!authorId) {
            return res.status(400).send({ status: false, message: "authorId is required" })
        };

        const authorIdData = await AuthorModel.findById(authorId)
        if (!authorIdData) {
            return res.status(404).send({ status: false, message: 'Author not found' })
        }

        // auhtorization
        if(authorId !== req.decodedToken) {
            return res.status(403).send({status: false, message: 'user is not authorised'})
        }

        // tags validation
       
        if (tags === "" || (Array.isArray(tags) && tags.length === 0)) {
            return res.status(400).send({ status: false, message: "Tags cannot be an empty array or string" });
        }
          
        if (Array.isArray(tags)) {
            const istagValid = tags.every(value => typeof value === "string" && value.length > 0);
            if (!istagValid) {
              return res.status(400).send({ status: false, message: "Tags should be an array of non-empty strings" });
            }
        }

        // category validation

        if(!category) {
            return res.status(400).send({ status: false, message: "category is required" });
        }
        if(!validator.isValid(category)) {
            return res.status(400).send({ status: false, message: "enter valid category" })
        }

        // subcategory validation

        if (subcategory === "" || (Array.isArray(subcategory) && subcategory.length === 0)) {
            return res.status(400).send({ status: false, message: "subcategory cannot be an empty array or string" });
        }
          
        if (Array.isArray(subcategory)) {
            const issubcategoryValid = subcategory.every(value => typeof value === "string" && value.length > 0);
            if (!issubcategoryValid) {
              return res.status(400).send({ status: false, message: "subcategory should be an array of non-empty strings" });
            }
        }

        data.isPublished = data.isPublished ? data.isPublished : false
        data.publishedAt = data.isPublished ? new Date() : null
    
        const blogData = await blogModel.create(data)
        return res.status(201).send({ status: true, data: blogData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



//========================================================

const getBlog = async function (req, res) {
    try {
        const filterQuery={isDeleted:false,deletedAt:null,isPublished:true};
        const filter = req.query
        if(isValidRequestBody(filter)){
        const {authorId,category,tags,subcategory}=filter
        }
        if(isValid(authorId) &isValidObjectId(authorId)){
          filterQuery['authorId']=authorId;
        }
         if(isValid(category)){
            filterQuery['category']=category.trim();
          }
          if(isValid(tags)){
            const tagArr=tags.trim().split(',').map(tag=>tag.trim())
            filterQuery['tags']={$all:tagArr};
          }
          if(isValid(subcategory)){
            const subCatArr=subcategory.trim().split(',').map(subcat=>subcat.trim())
            filterQuery['subcategory']={$all:subCatArr};
          }
        const data = await blogModel.find(filterQuery)

        if (Array.isArray(data) && data.length == 0) return res.status(404).send({ status: false, message: "No blog found" })

        return res.status(201).send({ status: true, message: "Blogs list", data: data })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

// ===========================================================================


const updateBlog = async function (req, res) {
    try {
        const blogId = req.params.blogId

        const data = req.body
        if(!req.body || Object.keys(req.body).length === 0){
            return res.status(400).send({ status: false, message: "No data is present in body" });
        }
        
        const updatedData = await blogModel.findOneAndUpdate(
            { _id: blogId },
            { $push: { tags: data.tags, subcategory: data.subcategory }, title: data.title, body: data.body, isPublished: true, publishedAt: new Date() },
            { new: true });

        return res.status(200).send({ status: true, message: "Blog updated successfully", data: updatedData });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


// =====================================================================================


const deleteuser = async function (req, res) {
    try {
      const blogId = req.params.blogId;
  
      await blogModel.findOneAndUpdate({ _id: blogId }, { isDeleted: true, deletedAt: new Date(), isPublished: false });
  
      return res.status(200).json({ status: true, message: "Blog deletion is successful" });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };


  
// ========================================================================

const deletequery = async function (req, res) {

    try {
        const filter = req.query;
        const userLoggedIn = req.decodedToken //unique
        filter.isDeleted =false;
        const blog = await blogModel.find(filter);  //
     
        if (blog.length === 0) {
            return res.status(400).send({ status: false, message: "Blogs not found"});
        }
        

        // authorisation

        const user = blog.filter((val) => val.authorId == userLoggedIn)
 
        if (user.length == 0) {
            return res.status(403).send({ status: false, message: "User not authorised"});
        }

        await blogModel.updateMany({ _id: { $in: user }}, { $set: { isDeleted: true, deletedAt: new Date(), isPublished : false } });
   
     
        return res.status(200).json({ status: true, message: "Blog deletion is successful"})
    }
    catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}


// ====================================================================


module.exports = {updateBlog, createBlog, getBlog, deletequery, deleteuser}



