import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";
import { PlusIcon, MapPinIcon } from "@heroicons/react/24/outline";
import api from "@/api/axios";
import FarmForm from "./farm-form";

export function FarmManagement() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/farms");
      setFarms(response.data || []);
    } catch (error) {
      console.error("Error fetching farms:", error);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmClick = (farm) => {
    setSelectedFarm(farm);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedFarm(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedFarm(null);
    fetchFarms();
  };

  const getSizeUnitLabel = (unit) => {
    const units = ["Acres", "Hectares", "Square Meters"];
    return units[unit] || "Unknown";
  };

  const getOwnershipTypeLabel = (type) => {
    const types = ["Owned", "Leased", "Rented"];
    return types[type] || "Unknown";
  };

  const getIrrigationTypeLabel = (type) => {
    const types = ["None", "Drip", "Sprinkler", "Flood"];
    return types[type] || "Unknown";
  };

  if (showForm) {
    return (
      <FarmForm
        farm={selectedFarm}
        onClose={handleFormClose}
        onSave={handleFormClose}
      />
    );
  }

  return (
    <div className="mt-6 mb-8 flex flex-col gap-12">
      <div className="flex items-center justify-between">
        <Typography variant="h4" color="blue-gray">
          Farm Management
        </Typography>
        <Button
          className="flex items-center gap-2"
          onClick={handleAddNew}
        >
          <PlusIcon className="h-5 w-5" />
          Add New Farm
        </Button>
      </div>

      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            My Farms
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-6 text-center">
              <Typography variant="small" color="blue-gray">
                Loading farms...
              </Typography>
            </div>
          ) : farms.length === 0 ? (
            <div className="p-6 text-center">
              <Typography variant="small" color="blue-gray" className="mb-4">
                No farms found. Click "Add New Farm" to get started.
              </Typography>
            </div>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Farm Name", "Size", "Ownership", "Irrigation", "Plots", ""].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {farms.map((farm, key) => {
                  const className = `py-3 px-5 ${
                    key === farms.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr
                      key={farm.id || farm._id || key}
                      className="hover:bg-blue-gray-50 cursor-pointer"
                      onClick={() => handleFarmClick(farm)}
                    >
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {farm.farmName}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {farm.totalSize} {getSizeUnitLabel(farm.sizeUnit)}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color="blue"
                          value={getOwnershipTypeLabel(farm.ownershipType)}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color="green"
                          value={getIrrigationTypeLabel(farm.irrigationType)}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {farm.plots?.length || 0} plot{farm.plots?.length !== 1 ? 's' : ''}
                        </Typography>
                      </td>
                      <td className={className}>
                        <MapPinIcon className="h-5 w-5 text-blue-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default FarmManagement;

