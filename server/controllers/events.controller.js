import Event from '../models/Event.js';

const eventsController = {
  create: async (req, res) => {
    try {
      const event = await Event.create(req.body);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Failed to create event' });
    }
  },

  getAll: async (req, res) => {
    try {
      const events = await Event.findAll();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  },

  getUpcoming: async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      const events = await Event.findUpcoming(limit);
      res.json(events);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      res.status(500).json({ message: 'Failed to fetch upcoming events' });
    }
  }
};

export default eventsController;