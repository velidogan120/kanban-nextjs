import * as yup from "yup";

export const inputSchemas = yup.object().shape({
    input:yup.string().required("Lütfen doldurunuz.")
})