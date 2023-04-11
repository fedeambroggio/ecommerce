module.exports = class CRUDService {
    constructor(model) {
        this.model = model;
    }

    create(data) {
        const entity = new this.model(data);
        return entity.save();
    }

    findById(id) {
        return this.model.findById(id);
    }

    find(query) {
        return this.model.find(query);
    }

    update(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    delete(id) {
        return this.model.findByIdAndDelete(id);
    }
}
