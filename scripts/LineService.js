
export default class LineService {
    static async getLine(xmin, ymin, xmax, ymax) {
        let res = await axios.get("http://localhost:8080/layer/rdslin", {params:{
                xmin: xmin,
                ymin: ymin,
                xmax: xmax,
                ymax: ymax
            }
        })
        return res.data
    }

    static async test() {
        let res = await axios.get("http://localhost:8080/rdslin")
        return res.data
    }
}