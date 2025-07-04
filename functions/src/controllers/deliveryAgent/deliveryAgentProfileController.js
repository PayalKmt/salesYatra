const {
  getAgentById,
  createAgent,
  updateAgent,
  updateAgentLocation,
  updateAgentStatus,
} = require("../../services/deliveryAgent/deliveryAgentProfileService");
const { StatusCodes } = require("http-status-codes");

const createAgentController = async (req, res) => {
  try {
    const agent = await createAgent(req.body);
    res.status(StatusCodes.CREATED).json(agent);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getAgentByIdController = async (req, res) => {
  try {
    const agent = await getAgentById(req.params.agentId);
    if (!agent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Agent not found" });
    }
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const updateAgentController = async (req, res) => {
  try {
    const { agentId, warehouseId } = req.params;
    const updated = await updateAgent(agentId, warehouseId, req.body);
    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const updateAgentLocationController = async (req, res) => {
  try {
    const { agentId, warehouseId } = req.params;
    const { location } = req.body;
    await updateAgentLocation(agentId, warehouseId, location);
    res
      .status(StatusCodes.OK)
      .json({ message: "Location updated successfully" });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const updateAgentStatusController = async (req, res) => {
  try {
    const { agentId, warehouseId } = req.params;
    const { status } = req.body;
    await updateAgentStatus(agentId, warehouseId, status);
    res.status(StatusCodes.OK).json({ message: "Status updated successfully" });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

module.exports = {
  createAgentController,
  getAgentByIdController,
  updateAgentController,
  updateAgentLocationController,
  updateAgentStatusController,
};
