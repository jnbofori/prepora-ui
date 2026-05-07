import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import api from "@/api/axios";
import MyTextInput from "@/components/MyTextInput";
import MySelectInput from "@/components/MySelectInput";

const sizeUnitOptions = [
  { value: 0, text: "Hectares" },
  { value: 1, text: "Acres" }
];

const ownershipTypeOptions = [
  { value: 0, text: "Owned" },
  { value: 1, text: "Leased" },
  { value: 2, text: "Family" }
];

const irrigationTypeOptions = [
  { value: 0, text: "RainFed" },
  { value: 1, text: "Drip" },
  { value: 2, text: "Sprinkler" },
  { value: 3, text: "None" }
];

const coordinateSchema = Yup.object().shape({
  longitude: Yup.number()
    .required("Required")
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  latitude: Yup.number()
    .required("Required")
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
});

const plotSchema = Yup.object().shape({
  plotCode: Yup.string().required("Required"),
  size: Yup.number()
    .required("Required")
    .positive("Size must be positive"),
  soilType: Yup.string().required("Required"),
  coordinates: Yup.array()
    .of(coordinateSchema)
    .min(3, "At least 3 coordinates required"),
});

const validationSchema = Yup.object().shape({
  farmName: Yup.string().required("Required"),
  totalSize: Yup.number()
    .required("Required")
    .positive("Size must be positive"),
  sizeUnit: Yup.number().required("Required"),
  ownershipType: Yup.number().required("Required"),
  irrigationType: Yup.number().required("Required"),
  coordinates: Yup.array()
    .of(coordinateSchema)
    .min(3, "At least 3 coordinates required for farm boundary"),
  plots: Yup.array().of(plotSchema),
});

export default function FarmForm({ farm, onClose, onSave }) {
  const [submitting, setSubmitting] = useState(false);

  const initialValues = farm
    ? {
        farmName: farm.farmName || "",
        totalSize: farm.totalSize || 0,
        sizeUnit: farm.sizeUnit ?? 0,
        ownershipType: farm.ownershipType ?? 0,
        irrigationType: farm.irrigationType ?? 0,
        coordinates: farm.coordinates?.length
          ? farm.coordinates.map((coord) => ({
              longitude: coord.longitude || "",
              latitude: coord.latitude || "",
            }))
          : [{ longitude: "", latitude: "" }],
        plots: farm.plots?.map((plot) => ({
          ...plot,
          coordinates: plot.coordinates?.length
            ? plot.coordinates.map((coord) => ({
                longitude: coord.longitude || "",
                latitude: coord.latitude || "",
              }))
            : [{ longitude: "", latitude: "" }],
        })) || [],
      }
    : {
        farmName: "",
        totalSize: 0,
        sizeUnit: 0,
        ownershipType: 0,
        irrigationType: 0,
        coordinates: [{ longitude: "", latitude: "" }],
        plots: [],
      };

  const handleSubmit = async (values) => {
    try {
      console.log(values);
      setSubmitting(true);
      const payload = {
        ...values,
        coordinates: values.coordinates
          .filter(
            (coord) => coord.longitude !== "" && coord.latitude !== ""
          )
          .map((coord) => ({
            longitude: parseFloat(coord.longitude),
            latitude: parseFloat(coord.latitude),
          })),
        plots: values.plots.map((plot) => ({
          plotCode: plot.plotCode,
          size: parseFloat(plot.size),
          soilType: plot.soilType,
          coordinates: plot.coordinates
            .filter(
              (coord) => coord.longitude !== "" && coord.latitude !== ""
            )
            .map((coord) => ({
              longitude: parseFloat(coord.longitude),
              latitude: parseFloat(coord.latitude),
            })),
        })),
        totalSize: parseFloat(values.totalSize),
      };

      if (farm && (farm.id || farm._id)) {
        const farmId = farm.id || farm._id;
        await api.put(`/farms/${farmId}`, payload);
      } else {
        await api.post("/farms", payload);
      }
      onSave();
    } catch (error) {
      console.error("Error saving farm:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to save farm. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 mb-8">
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={onClose}
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Farms
        </Button>
        <Typography variant="h4" color="blue-gray">
          {farm ? "Edit Farm" : "Add New Farm"}
        </Typography>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, handleChange }) => (
          <Form>
            <Card className="mb-6">
              <CardHeader variant="gradient" color="gray" className="mb-2 p-6">
                <Typography variant="h6" color="white">
                  Farm Information
                </Typography>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <MyTextInput
                  name="farmName"
                  label="Farm Name"
                  placeholder="Enter farm name"
                  size="lg"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <MyTextInput
                      name="totalSize"
                      label="Total Size"
                      type="number"
                      placeholder="0"
                      size="lg"
                    />
                  </div>
                  <div> 
                    <MySelectInput
                      name="sizeUnit"
                      label="Size Unit"
                      options={sizeUnitOptions}
                      size="lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div> 
                    <MySelectInput
                      name="ownershipType"
                      label="Ownership Type"
                      options={ownershipTypeOptions}
                      size="lg"
                    />
                  </div>
                  <div>           
                    <MySelectInput
                      name="irrigationType"
                      label="Irrigation Type"
                      options={irrigationTypeOptions}
                      size="lg"
                    />
                  </div>
                </div>

                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="my-2 font-medium underline"
                  >
                    Farm Boundary Coordinates
                  </Typography>
                  <FieldArray name="coordinates">
                    {({ push, remove }) => (
                      <div className="flex flex-col gap-4">
                        {values.coordinates.map((coord, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-3 gap-4 items-center"
                          >
                            <div>
                              <MyTextInput
                                name={`coordinates.${index}.longitude`}
                                label="Longitude"
                                type="number"
                                placeholder="-0.1276"
                                size="lg"
                              />
                            </div>
                            <div>
                              <MyTextInput
                                name={`coordinates.${index}.latitude`}
                                label="Latitude"
                                type="number"
                                placeholder="51.5074"
                                size="lg"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="text"
                              color="red"
                              onClick={() => remove(index)}
                              disabled={values.coordinates.length <= 1}
                            >
                              <TrashIcon className="h-5 w-5 mt-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outlined"
                          className="flex items-center gap-2 w-fit"
                          onClick={() =>
                            push({ longitude: "", latitude: "" })
                          }
                        >
                          <PlusIcon className="h-5 w-5" />
                          Add Coordinate
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </CardBody>
            </Card>

            <Card className="mb-6 mt-12">
              <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" color="white">
                    Plots
                  </Typography>
                </div>
              </CardHeader>
              <CardBody>
                <FieldArray name="plots">
                  {({ push, remove }) => (
                    <div className="flex flex-col gap-6">
                      {values.plots.map((plot, plotIndex) => (
                        <Card key={plotIndex} className="p-4 border border-blue-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <Typography variant="h6" color="blue-gray">
                              Plot {plotIndex + 1}
                            </Typography>
                            <Button
                              type="button"
                              variant="text"
                              color="red"
                              onClick={() => remove(plotIndex)}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <MyTextInput
                                  name={`plots.${plotIndex}.plotCode`}
                                  label="Plot Code"
                                  placeholder="PLOT-001"
                                  size="lg"
                                />
                              </div>
                              <div>
                                <MyTextInput
                                  name={`plots.${plotIndex}.size`}
                                  label="Size"
                                  type="number"
                                  placeholder="2.5"
                                  size="lg"
                                />
                              </div>
                              <div>
                                <MyTextInput
                                  name={`plots.${plotIndex}.soilType`}
                                  label="Soil Type"
                                  placeholder="Loamy"
                                  size="lg"
                                />
                              </div>
                            </div>

                            <div>
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="mb-2 font-medium"
                              >
                                Plot Coordinates
                              </Typography>
                              <FieldArray name={`plots.${plotIndex}.coordinates`}>
                                {({ push: pushCoord, remove: removeCoord }) => (
                                  <div className="flex flex-col gap-4">
                                    {plot.coordinates?.map((coord, coordIndex) => (
                                      <div
                                        key={coordIndex}
                                        className="grid grid-cols-3 gap-4 items-end"
                                      >
                                        <div>
                                          <MyTextInput
                                            name={`plots.${plotIndex}.coordinates.${coordIndex}.longitude`}
                                            label="Longitude"
                                            type="number"
                                            placeholder="-0.1276"
                                            size="lg"
                                          />
                                        </div>
                                        <div>
                                          <MyTextInput
                                            name={`plots.${plotIndex}.coordinates.${coordIndex}.latitude`}
                                            label="Latitude"
                                            type="number"
                                            placeholder="51.5074"
                                            size="lg"
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="text"
                                          color="red"
                                          onClick={() => removeCoord(coordIndex)}
                                          disabled={
                                            plot.coordinates?.length <= 1
                                          }
                                        >
                                          <TrashIcon className="h-5 w-5" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outlined"
                                      size="sm"
                                      className="flex items-center gap-2 w-fit"
                                      onClick={() =>
                                        pushCoord({ longitude: "", latitude: "" })
                                      }
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                      Add Coordinate
                                    </Button>
                                  </div>
                                )}
                              </FieldArray>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outlined"
                        className="flex items-center gap-2"
                        onClick={() =>
                          push({
                            plotCode: "",
                            size: 0,
                            soilType: "",
                            coordinates: [{ longitude: "", latitude: "" }],
                          })
                        }
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add Plot
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </CardBody>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button variant="outlined" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : farm ? "Update Farm" : "Create Farm"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

