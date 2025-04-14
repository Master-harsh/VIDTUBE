const asyncHandler = (reqestaHandler) => {
    return (req, res, next) => {
        Promise.resolve(reqestaHandler(req, res, next)).catch
        ((err) => next(err));
    }
}

export default asyncHandler;
