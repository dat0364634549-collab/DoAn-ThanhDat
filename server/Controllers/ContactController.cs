using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<Contact>> GetContact()
        {
            var contact = await _context.Contacts.FirstOrDefaultAsync();
            if (contact == null)
            {
                return NotFound();
            }
            return contact;
        }

        [HttpPut]
        public async Task<IActionResult> UpdateContact(Contact contact)
        {
            var existingContact = await _context.Contacts.FirstOrDefaultAsync();
            if (existingContact == null)
            {
                return NotFound();
            }

            existingContact.Name = contact.Name;
            existingContact.Email = contact.Email;
            existingContact.Phone = contact.Phone;
            existingContact.Facebook = contact.Facebook;
            existingContact.Description = contact.Description;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

